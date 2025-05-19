using gRPC.telemetry.Server.Models;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class SystemDeviceInfo
    {
        public DeviceInfo DeviceInfo { get; set; }
        public SystemUsagePayload SystemInfo { get; set; }
    }
    public class SystemInfoSnapshotHolder : ServiceContentSnapshotHolder<SystemDeviceInfo>
    {

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
        public static SystemInfo Instance { get; set; } = new SystemInfo();

        public void RemoveStaleDevices(TimeSpan staleThreshold)
        {
            base.RemoveStaleDevices(dev => dev.DeviceInfo.LastUpdated, staleThreshold);
        }
        public SystemInfoSnapshotHolder snapShot()
        {
            SystemInfoSnapshotHolder snapshotHolder = new();
            snapshotHolder.SnapshotTime = DateTime.UtcNow;
            snapshotHolder.MonitoredDevices = base.GetDeviceSnapshot();
            return snapshotHolder;
        }
    }
}
