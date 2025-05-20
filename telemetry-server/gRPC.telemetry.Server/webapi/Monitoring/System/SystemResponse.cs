using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public enum SystemWarningType
    {
        CPUusage,
        RAMusage,
        PagefileUsage
    }
    public class systemPayload
    {
        public double cpuUsagePercent { get; set; }
        public double ramTotalBytes { get; set; }
        public double ramUsedBytes { get; set; }
        public double pagefileTotalBytes { get; set; }
        public double pagefileUsedBytes { get; set; }
        public DateTime lastBootTimestamp { get; set; }
    }
    public class SystemResponse
    {
        public SystemResponse(DateTime snapShotTime)
        {
            responseTime = snapShotTime;
        }
        public DateTime responseTime { get; set; }
        public ConcurrentDictionary<Guid, SystemDeviceInfo?> monitoredDevices { get; set; } = new();
        public ConcurrentDictionary<Guid, SystemDeviceInfo> autoDevices { get; set; } = new();
        public ConcurrentDictionary<Guid, OneDeviceWarningsHolder> warnings { get; set; } = new();
        public ConcurrentDictionary<Guid, SystemErrorInfo> errors { get; set; } = new();
    }
}
