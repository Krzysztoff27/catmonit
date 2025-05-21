namespace gRPC.telemetry.Server.Models;

public class ResponseModel
{
    public DateTime Timestamp { get; set; }
    public string Hostname { get; set; }
    public string IpAddress { get; set; }

    public string IpMask { get; set; }
    public string Uuid { get; set; }
    public string Os { get; set; }
    public PayloadType PayloadType { get; set; }
    public object Payload { get; set; }
}

public class NetworkPayload
{
    public string InterfaceName { get; set; }
    public double RxMbps { get; set; }
    public double TxMbps { get; set; }
    
    public string IpAddress { get; set; }
    
    public string IpMask { get; set; }
    public bool? IsMain { get; set; }
}

public class DiskPayload
{
    public string MountPoint { get; set; }
    public long Usage { get; set; }
    public long Capacity { get; set; }
}

public class SharePayload 
{
    public string SharePath { get; set; }
    public long Usage { get; set; }
    public long Capacity { get; set; }
}

public class DiskErrorsPayload
{
    public string Message { get; set; }
    public string Source  { get; set; }
    public long Timestamp { get; set; }
    public string MountPoint { get; set; }
}

public class SystemErrorsPayload
{
   public string Message { get; set; }
   public string Source  { get; set; }
   public long Timestamp { get; set; }
}

public class SystemUsagePayload
{
    public double CpuUsagePercent { get; set; }
    public double RamTotalBytes { get; set; }
    public double RamUsedBytes { get; set; }
    public double PagefileTotalBytes { get; set; }
    public double PagefileUsedBytes { get; set; }
    
    //Cast to DateTime using: DateTimeOffset.FromUnixTimeSeconds(protoMsg.LastBootTimestamp).DateTime;
    public double LastBootTimestamp { get; set; }
}

public enum PayloadType
{
    Network,
    Disks,
    Shares,
    DiskErrors,
    SystemErrors,
    SystemUsage,
    None
}
