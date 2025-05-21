using gRPC.telemetry.Server.Models;
using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class TresholdsDisk
    {
        public const int SpaceWarningTresholdValue = 90; // precent
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
    public class DisksInfoSnapshotHolder : ServiceContentSnapshotHolder<DisksDeviceInfo>
    {
        public ConcurrentDictionary<Guid, OneDeviceDiskWarningsHolder> DiskWarnings { get; set; } = new();
        public void CalculateBestAutoCandidates(int n)
        {
            AutoCandidates = MonitoredDevices
                .Values
                .OrderBy(device => device.DisksInfo.Count)
                .Take(n)
                .Select(device => device.DeviceInfo.uuid)
                .ToList();
        }
        public void CalculateWarnings()
        {
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
                                warnings = new List<string> { $"Disk ({disk.MountPoint}) storage is low ({100-((float)disk.Usage / (float)disk.Capacity * 100)}%). Please free up storage." }
                            },
                            (id, existingHolder) =>
                            {
                                lock (existingHolder)
                                {
                                    existingHolder.warnings.Add($"Disk ({disk.MountPoint}) storage is low ({100 - ((float)disk.Usage / (float)disk.Capacity * 100)}%). Please free up storage.");
                                }
                                return existingHolder;
                            }
                        );

                    }
                }
            }
        }
    }
    public class DisksInfo : ServiceContentInfo<DisksDeviceInfo>
    {
        public static DisksInfo Instance { get; set; } = new DisksInfo();

        public void RemoveStaleDevices(TimeSpan staleThreshold)
        {
            base.RemoveStaleDevices(dev => dev.DeviceInfo.lastUpdated, staleThreshold);
        }
        public DisksInfoSnapshotHolder snapShot()
        {
            DisksInfoSnapshotHolder snapshotHolder = new();
            snapshotHolder.SnapshotTime = DateTime.UtcNow;
            snapshotHolder.MonitoredDevices = base.GetDeviceSnapshot();
            return snapshotHolder;
        }
    }
}
