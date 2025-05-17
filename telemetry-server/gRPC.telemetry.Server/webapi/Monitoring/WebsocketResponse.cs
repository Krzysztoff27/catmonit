namespace gRPC.telemetry.Server.webapi.Monitoring
{
    public class Warning
    {
        public Guid Device { get; set; }
        public string Message { get; set; }
    }
    public class Error
    {
        public Guid Device { get; set; }
        public string Message { get; set; }
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
