using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public enum SystemWarningType
    {
        CPUusage,
        RAMusage,
        PagefileUsage
    }
    public class SystemPayload
    {
        public double CpuUsagePercent { get; set; }
        public double RamTotalBytes { get; set; }
        public double RamUsedBytes { get; set; }
        public double PagefileTotalBytes { get; set; }
        public double PagefileUsedBytes { get; set; }
        public DateTime LastBootTimestamp { get; set; }
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
        public ConcurrentDictionary<Guid, SystemErrorInfo> warnings { get; set; } = new();
        public ConcurrentDictionary<Guid, SystemErrorInfo> errors { get; set; } = new();
    }
}
