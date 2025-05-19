using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class SystemResponse
    {
        public SystemResponse(DateTime snapShotTime)
        {
            responseTime = snapShotTime;
        }
        public DateTime responseTime { get; set; }
        public ConcurrentDictionary<Guid, SystemDeviceInfo?> monitoredDevices { get; set; } = new();
        public ConcurrentDictionary<Guid, SystemDeviceInfo> autoDevices { get; set; } = new();
    }
}
