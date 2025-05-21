namespace gRPC.telemetry.Server.webapi.Monitoring
{
    public class deviceInfo
    {
        public DateTime lastUpdated { get; set; }
        public string hostname { get; set; }
        public string ipAddress { get; set; }
        public Guid uuid { get; set; }
        public string os { get; set; }
    }
}
