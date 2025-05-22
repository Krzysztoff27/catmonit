using gRPC.telemetry.Server.Models;
using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class TresholdsDisk
    {
        public const int SpaceWarningTresholdValue = 90; // precent
        public static TimeSpan errorCutoffTime = TimeSpan.FromDays(1);
    }
    
    public class OneDeviceDiskWarningsHolder
    {
        public deviceInfo deviceInfo { get; set; }
        public List<string> warnings { get; set; }
    }

    public class DisksDeviceInfo
    {
        public deviceInfo DeviceInfo { get; set; }
        public List<DiskPayload> DisksInfo { get; set; }
    }

    public class DiskErrorsPayloadWithNormalTimestamp
    {
        public string Message { get; set; }
        public string Source { get; set; }
        public DateTime Timestamp { get; set; }
        public string MountPoint { get; set; }

        public override bool Equals(object obj)
        {
            if (obj is not DiskErrorsPayloadWithNormalTimestamp other)
                return false;

            return Message == other.Message && Source == other.Source && Timestamp == other.Timestamp && MountPoint == other.MountPoint;
        }
        public override int GetHashCode()
        {
            return HashCode.Combine(Message, Source, Timestamp, MountPoint);
        }

    }

    public class DiskErrorInfo
    {
        public deviceInfo deviceInfo { get; set; }
        public List<DiskErrorsPayloadWithNormalTimestamp> DiskErrorsPayloads { get; set; }
    }

    public class DisksInfoSnapshotHolder : ServiceContentSnapshotHolder<DisksDeviceInfo>
    {
        public ConcurrentDictionary<Guid, OneDeviceDiskWarningsHolder> DiskWarnings { get; set; } = new();
        public ConcurrentDictionary<Guid, DiskErrorInfo> DiskErrorsDictionary { get; set; } = new();
        
        public int totalWarningCount { get; set; } = 0;
        public int totalErrorCount { get; set; } = 0;
        public void CalculateBestAutoCandidates(int n)
        {
            AutoCandidates = MonitoredDevices
            .Values
            .OrderByDescending(device => device.DisksInfo
                .Where(disk => disk.Capacity > 0)
                .DefaultIfEmpty()
                .Average(disk => (double)((float)disk.Usage / (float)disk.Capacity)))
            .Take(n)
            .Select(device => device.DeviceInfo.uuid)
            .ToList();
        }
        public void CalculateWarnings()
        {
            totalWarningCount = 0;
            DiskWarnings.Clear();
            foreach ((Guid deviceId, DisksDeviceInfo deviceInfo) in MonitoredDevices)
            {
                foreach (DiskPayload disk in deviceInfo.DisksInfo) {
                    if (((float)disk.Usage / (float)disk.Capacity *100)> TresholdsDisk.SpaceWarningTresholdValue)
                    {
                        DiskWarnings.AddOrUpdate(
                            deviceId,
                            id => new OneDeviceDiskWarningsHolder
                            {
                                deviceInfo = deviceInfo.DeviceInfo,
                                warnings = new List<string> { $"Disk ({disk.MountPoint}) storage is nearly full ({Math.Round(((float)disk.Usage / (float)disk.Capacity * 100))}%). Please free up storage." }
                            },
                            (id, existingHolder) =>
                            {
                                lock (existingHolder)
                                {
                                    existingHolder.warnings.Add($"Disk ({disk.MountPoint}) storage is nearly full ({Math.Round(((float)disk.Usage / (float)disk.Capacity * 100))}%). Please free up storage.");
                                }
                                return existingHolder;
                            }
                        );
                        totalWarningCount++;

                    }
                }
            }
        }
    }
    public class DisksInfo : ServiceContentInfo<DisksDeviceInfo>
    {
        public static DisksInfo Instance { get; set; } = new DisksInfo();
        public ConcurrentDictionary<Guid, DiskErrorInfo> DiskErrorsDictionary { get; set; } = new();
        public int totalErrorCount { get; set; } = 0;

        public void RemoveStaleDevices(TimeSpan staleThreshold)
        {
            base.RemoveStaleDevices(dev => dev.DeviceInfo.lastUpdated, staleThreshold);


            // Cutoff time
            var cutoffTime = DateTimeOffset.UtcNow - TresholdsDisk.errorCutoffTime;

            var keysToRemove = new List<Guid>();

            int removedErrors = 0;
            // Clean up errors
            foreach (var entry in DiskErrorsDictionary)
            {
                var key = entry.Key;
                var errorInfo = entry.Value;

                if (errorInfo?.DiskErrorsPayloads != null)
                {
                    var errorCountBefore = errorInfo.DiskErrorsPayloads.Count;
                    errorInfo.DiskErrorsPayloads = errorInfo.DiskErrorsPayloads
                        .Where(payload => payload.Timestamp >= cutoffTime)
                        .ToList();
                    removedErrors += errorCountBefore - errorInfo.DiskErrorsPayloads.Count;
                    if (!errorInfo.DiskErrorsPayloads.Any())
                    {
                        keysToRemove.Add(key);
                    }
                }
            }
            totalErrorCount -= removedErrors;

            // Remove SystemErrorInfos with no payloads
            foreach (var key in keysToRemove)
            {
                DiskErrorsDictionary.TryRemove(key, out _);
            }
        }
        public DisksInfoSnapshotHolder snapShot()
        {
            DisksInfoSnapshotHolder snapshotHolder = new();
            snapshotHolder.SnapshotTime = DateTime.UtcNow;
            snapshotHolder.MonitoredDevices = base.GetDeviceSnapshot();
            snapshotHolder.totalErrorCount = totalErrorCount;
            snapshotHolder.DiskErrorsDictionary = DiskErrorsDictionary;
            return snapshotHolder;
        }

        public void AddOrUpdateErrors(DiskErrorInfo error)
        {
            var uuid = error.deviceInfo.uuid;
            int insertedCount = 0;

            DiskErrorsDictionary.AddOrUpdate(uuid,
                addValueFactory: key =>
                {
                    // New entry, count all payloads
                    if (error.DiskErrorsPayloads != null)
                    {
                        insertedCount = error.DiskErrorsPayloads.Count;
                    }

                    return new DiskErrorInfo
                    {
                        deviceInfo = error.deviceInfo,
                        DiskErrorsPayloads = error.DiskErrorsPayloads != null
                            ? new List<DiskErrorsPayloadWithNormalTimestamp>(error.DiskErrorsPayloads)
                            : new List<DiskErrorsPayloadWithNormalTimestamp>()
                    };
                },
                updateValueFactory: (key, existingError) =>
                {
                    existingError.deviceInfo = error.deviceInfo;

                    if (existingError.DiskErrorsPayloads == null)
                        existingError.DiskErrorsPayloads = new List<DiskErrorsPayloadWithNormalTimestamp>();

                    if (error.DiskErrorsPayloads != null)
                    {
                        foreach (var payload in error.DiskErrorsPayloads)
                        {
                            if (!existingError.DiskErrorsPayloads.Contains(payload))
                            {
                                existingError.DiskErrorsPayloads.Add(payload);
                                insertedCount++;
                            }
                        }
                    }

                    return existingError;
                });

            totalErrorCount += insertedCount;
        }
    }
}
