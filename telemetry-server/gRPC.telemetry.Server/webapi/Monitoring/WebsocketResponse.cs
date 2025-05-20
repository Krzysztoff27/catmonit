namespace gRPC.telemetry.Server.webapi.Monitoring
{
    public class SmallDeviceInfo
    {
        public string Hostname { get; set; }
        public string IpAddress { get; set; }
        public Guid Uuid { get; set; }
        public string Os { get; set; }

    }
    public class Warning
    {
        public deviceInfo Device { get; set; }
        public string Message { get; set; }
    }
    public class deviceInfo
    {
        public DateTime lastUpdated { get; set; }
        public string hostname { get; set; }
        public string ipAddress { get; set; }
        public Guid uuid { get; set; }
        public string os { get; set; }
    }
}
