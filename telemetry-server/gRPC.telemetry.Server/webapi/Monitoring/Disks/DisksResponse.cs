using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class DisksResponse
    {
        public DisksResponse(DateTime snapShotTime)
        {
            responseTime = snapShotTime;
        }
        public DateTime responseTime { get; set; }
        public ConcurrentDictionary<Guid, DisksDeviceInfo?> monitoredDevices { get; set; } = new();
        public ConcurrentDictionary<Guid, DisksDeviceInfo> autoDevices { get; set; } = new();
        public List<Warning> warnings { get; set; } = new();
        public List<Error> errors { get; set; } = new();
    }
}
