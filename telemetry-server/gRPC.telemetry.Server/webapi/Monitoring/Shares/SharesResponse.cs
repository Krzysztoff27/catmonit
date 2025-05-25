using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class SharesResponse
    {
        public SharesResponse(DateTime snapShotTime)
        {
            responseTime = snapShotTime;
        }
        public DateTime responseTime { get; set; }
        public ConcurrentDictionary<Guid, SharesDeviceInfo?> monitoredDevices { get; set; } = new();
        public ConcurrentDictionary<Guid, SharesDeviceInfo> autoDevices { get; set; } = new();
    }
}
