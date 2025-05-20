namespace gRPC.telemetry.Server.webapi.Monitoring
{
    public class SmallDeviceInfo
    {
        public string Hostname { get; set; }
        public string IpAddress { get; set; }
        public Guid Uuid { get; set; }
        public string Os { get; set; }

    }
    public class WarningPayload
    {
        public string Message { get; set; }
    }
    public class Warning
    {
        public SmallDeviceInfo Device { get; set; }
        public List<WarningPayload> Messages { get; set; }
    }
    public class DeviceInfo
    {
        public DateTime LastUpdated { get; set; }
        public string Hostname { get; set; }
        public string IpAddress { get; set; }
        public Guid Uuid { get; set; }
        public string Os { get; set; }
    }
}
