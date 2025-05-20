using gRPC.telemetry.Server.Models;
using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{

    public class SystemDeviceInfo
    {
        public DeviceInfo DeviceInfo { get; set; }
        public SystemPayload SystemInfo { get; set; }
    }

    public class SystemErrorInfo
    {
        public DeviceInfo DeviceInfo { get; set; }
        public List<SystemErrorsPayload> SystemErrorsPayloads { get; set; }
    }


    public class SystemInfoSnapshotHolder : ServiceContentSnapshotHolder<SystemDeviceInfo>
    {
        public ConcurrentDictionary<Guid, SystemErrorInfo> SystemErrorsDictionary { get; set; } = new();
        public void CalculateBestAutoCandidates(int n)
        {
            AutoCandidates = MonitoredDevices
                .Values
                .OrderByDescending(device => device.SystemInfo.RamTotalBytes)
                .Take(n)
                .Select(device => device.DeviceInfo.Uuid)
                .ToList();
        }
        public void CalculateWarnings()
        {

        }
        public void GetErrors()
        {

        }
    }
    public class SystemInfo : ServiceContentInfo<SystemDeviceInfo>
    {
        public ConcurrentDictionary<Guid, SystemErrorInfo> SystemErrorsDictionary { get; set; } = new();
        public static SystemInfo Instance { get; set; } = new SystemInfo();

        public void RemoveStaleDevices(TimeSpan staleThreshold)
        {
            base.RemoveStaleDevices(dev => dev.DeviceInfo.LastUpdated, staleThreshold);

            // Cutoff time
            var cutoffTime = DateTimeOffset.UtcNow - staleThreshold;
            var cutoffUnixTimestamp = cutoffTime.ToUnixTimeMilliseconds();

            // Clean up errors
            foreach (var entry in SystemErrorsDictionary)
            {
                var errorInfo = entry.Value;
                if (errorInfo?.SystemErrorsPayloads != null)
                {
                    errorInfo.SystemErrorsPayloads = errorInfo.SystemErrorsPayloads
                        .Where(payload => payload.Timestamp >= cutoffUnixTimestamp)
                        .ToList();
                }
            }
        }
        public SystemInfoSnapshotHolder snapShot()
        {
            SystemInfoSnapshotHolder snapshotHolder = new();
            snapshotHolder.SnapshotTime = DateTime.UtcNow;
            snapshotHolder.MonitoredDevices = base.GetDeviceSnapshot();
            snapshotHolder.SystemErrorsDictionary = SystemErrorsDictionary;
            return snapshotHolder;
        }
        public void AddOrUpdateErrors(SystemErrorInfo error)
        {
            var uuid = error.DeviceInfo.Uuid;

            SystemErrorsDictionary.AddOrUpdate(uuid,
                error,
                (key, existingError) =>
                {
                    existingError.DeviceInfo = error.DeviceInfo;

                    if (existingError.SystemErrorsPayloads == null)
                        existingError.SystemErrorsPayloads = new List<SystemErrorsPayload>();

                    if (error.SystemErrorsPayloads != null)
                    {
                        foreach (var payload in error.SystemErrorsPayloads)
                        {
                            if (!existingError.SystemErrorsPayloads.Contains(payload))
                            {
                                existingError.SystemErrorsPayloads.Add(payload);
                            }
                        }
                    }

                    return existingError;
                });
        }

    }
}
