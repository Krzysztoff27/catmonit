using gRPC.telemetry.Server.Models;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class SharesDeviceInfo
    {
        public deviceInfo deviceInfo { get; set; }
        public List<SharePayload> sharesInfo { get; set; }
    }
    public class SharesInfoSnapshotHolder : ServiceContentSnapshotHolder<SharesDeviceInfo>
    {

        public void CalculateBestAutoCandidates(int n)
        {
            AutoCandidates = MonitoredDevices
            .Values
            .OrderByDescending(device => device.sharesInfo
                .Where(share => share.Capacity > 0)
                .Select(share => (double)share.Usage / share.Capacity)
                .DefaultIfEmpty(0)
                .Average())
            .Take(n)
            .Select(device => device.deviceInfo.uuid)
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
            base.RemoveStaleDevices(dev => dev.deviceInfo.lastUpdated, staleThreshold);
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
