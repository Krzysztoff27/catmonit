using System.Text.Json;
using Grpc.Core;
using gRPC.telemetry;

public class TelemetryService : gRPC.telemetry.TelemetryService.TelemetryServiceBase
{
    public override async Task<TelemetryResponse> StreamTelemetry(
        IAsyncStreamReader<TelemetryRequest> requestStream,
        ServerCallContext context)
    {
        var output = new List<object>();

        try
        {
            await foreach (var request in requestStream.ReadAllAsync())
            {
                var entry = new Dictionary<string, object>
                {
                    ["timestamp"] = DateTime.UtcNow,
                    ["hostname"] = request.Hostname,
                    ["ip_address"] = request.IpAddress,
                    ["uuid"] = request.Uuid,
                    ["os"] = request.OperatingSystem,
                    ["payload_type"] = request.PayloadCase.ToString(),
                    ["payload"] = null
                };

                switch (request.PayloadCase)
                {
                    case TelemetryRequest.PayloadOneofCase.Network:
                        var net = request.Network;
                        entry["payload"] = new
                        {
                            interface_name = net.InterfaceName,
                            rx_mbps = net.RxMbps,
                            tx_mbps = net.TxMbps,
                            is_main = net.InterfaceRoleCase == NetworkStats.InterfaceRoleOneofCase.IsMain && net.IsMain
                        };
                        break;

                    case TelemetryRequest.PayloadOneofCase.Disks:
                        var disks = new List<object>();
                        foreach (var disk in request.Disks.Entries)
                        {
                            disks.Add(new
                            {
                                mount_point = disk.MountPoint,
                                usage = disk.Usage,
                                capacity = disk.Capacity,
                                usage_percent = disk.Capacity > 0 ? (100.0 * disk.Usage / disk.Capacity) : 0
                            });
                        }
                        entry["payload"] = disks;
                        break;

                    case TelemetryRequest.PayloadOneofCase.Shares:
                        var shares = new List<object>();
                        foreach (var share in request.Shares.Entries)
                        {
                            shares.Add(new
                            {
                                share_path = share.SharePath,
                                usage = share.Usage,
                                capacity = share.Capacity,
                                usage_percent = share.Capacity > 0 ? (100.0 * share.Usage / share.Capacity) : 0
                            });
                        }
                        entry["payload"] = shares;
                        break;

                    case TelemetryRequest.PayloadOneofCase.None:
                    default:
                        entry["error"] = "No valid payload received.";
                        break;
                }

                output.Add(entry);
            }

            var json = JsonSerializer.Serialize(new
            {
                status = "ok",
                received = output
            }, new JsonSerializerOptions { WriteIndented = false });
            
            Console.WriteLine(json); //For debug purposes 
            return new TelemetryResponse { Status = json };
        }
        catch (Exception ex)
        {
            var errorJson = JsonSerializer.Serialize(new
            {
                status = "error",
                message = ex.Message,
                stackTrace = ex.StackTrace
            });

            Console.WriteLine(errorJson); //For debug purposes
            return new TelemetryResponse { Status = errorJson };
        }
    }
}
