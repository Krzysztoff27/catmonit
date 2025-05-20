using gRPC.telemetry.Server.Models;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class DisksDeviceInfo
    {
        public DeviceInfo DeviceInfo { get; set; }
        public List<DiskPayload> DisksInfo { get; set; }
    }
    public class DisksInfoSnapshotHolder : ServiceContentSnapshotHolder<DisksDeviceInfo>
    {
        public static float deviceMemoryTreshold = 0.9f;
        public void CalculateBestAutoCandidates(int n)
        {
            AutoCandidates = MonitoredDevices
                .Values
                .OrderBy(device => device.DisksInfo.Count)
                .Take(n)
                .Select(device => device.DeviceInfo.Uuid)
                .ToList();
        }
        public void CalculateWarnings()
        {
            foreach ((Guid deviceId, DisksDeviceInfo deviceInfo) in MonitoredDevices)
            {
                foreach (DiskPayload disk in deviceInfo.DisksInfo) {
                    if ((float)disk.Usage / (float)disk.Capacity >= deviceMemoryTreshold)
                    {
                        // warning
                        /*Warnings.Add(new Warning { 
                            Device = new SmallDeviceInfo {Hostname = deviceInfo.DeviceInfo.Hostname, IpAddress= deviceInfo.DeviceInfo.IpAddress, Os=deviceInfo.DeviceInfo.Os, Uuid=deviceId }, 
                            Message = $"{disk.MountPoint} free space is {((1f - ((float)disk.Usage / (float)disk.Capacity)) * 100)}%. Please free up storage." 
                        });*/
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
            base.RemoveStaleDevices(dev => dev.DeviceInfo.LastUpdated, staleThreshold);
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
