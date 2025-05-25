using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class NetworkResponse
    {
        public NetworkResponse(DateTime snapShotTime)
        {
            responseTime = snapShotTime;
        }
        public DateTime responseTime { get; set; }
        public ConcurrentDictionary<Guid, NetworkDeviceInfo?> monitoredDevices { get; set; } = new();
        public ConcurrentDictionary<Guid, NetworkDeviceInfo> autoDevices { get; set; } = new();
    }
}
