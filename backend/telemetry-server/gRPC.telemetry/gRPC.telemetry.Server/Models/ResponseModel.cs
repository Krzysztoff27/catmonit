namespace gRPC.telemetry.Server.Models;

public class ResponseModel
{
    public DateTime timestamp;
    public string hostname;
    public string ip_address;
    public string uuid;
    public string os;
    public TelemetryRequest.PayloadOneofCase payload_type;
    public object payload;
}


public class payloadDisks
{
    public string mount_point;
    public long usage;
    public long capacity;
}
