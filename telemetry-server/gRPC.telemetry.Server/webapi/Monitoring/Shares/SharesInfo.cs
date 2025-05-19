using gRPC.telemetry.Server.Models;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class SharesDeviceInfo
    {
        public DeviceInfo DeviceInfo { get; set; }
        public List<SharePayload> SharesInfo { get; set; }
    }
    public class SharesInfoSnapshotHolder : ServiceContentSnapshotHolder<SharesDeviceInfo>
    {

        public void CalculateBestAutoCandidates(int n)
        {
            AutoCandidates = MonitoredDevices
                .Values
                .OrderBy(device => device.SharesInfo.Count)
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
    public class SharesInfo : ServiceContentInfo<SharesDeviceInfo>
    {
        public static SharesInfo Instance { get; set; } = new SharesInfo();

        public void RemoveStaleDevices(TimeSpan staleThreshold)
        {
            base.RemoveStaleDevices(dev => dev.DeviceInfo.LastUpdated, staleThreshold);
        }
        public SharesInfoSnapshotHolder snapShot()
        {
            SharesInfoSnapshotHolder snapshotHolder = new();
            snapshotHolder.SnapshotTime = DateTime.UtcNow;
            snapshotHolder.MonitoredDevices = base.GetDeviceSnapshot();
            return snapshotHolder;
        }
    }
}
