using System.Text.Json;
using Grpc.Core;
using gRPC.telemetry;
using gRPC.telemetry.Server.Models;
using Microsoft.CSharp.RuntimeBinder;
using Microsoft.VisualBasic.CompilerServices;

public class TelemetryService : gRPC.telemetry.TelemetryService.TelemetryServiceBase
{
    public override async Task<TelemetryResponse> StreamTelemetry(
        IAsyncStreamReader<TelemetryRequest> requestStream,
        ServerCallContext context)
    {
        var output = new List<ResponseModel>();

        try
        {
            await foreach (var request in requestStream.ReadAllAsync())
            {
                var entry = new ResponseModel
                {
                    timestamp = DateTime.UtcNow,
                    hostname = request.Hostname,
                    ip_address = request.IpAddress,
                    uuid = request.Uuid,
                    os = request.OperatingSystem,
                    payload_type = request.PayloadCase,
                    payload = null
                };

                switch (request.PayloadCase)
                {
                    case TelemetryRequest.PayloadOneofCase.Network:
                        var net = request.Network;
                        entry.payload = new
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
                            disks.Add(new payloadDisks
                            {
                                mount_point = disk.MountPoint,
                                usage = disk.Usage,
                                capacity = disk.Capacity
                            });
                        }
                        entry.payload = disks;
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
                            });
                        }
                        entry.payload = shares;
                        break;

                    case TelemetryRequest.PayloadOneofCase.None:
                    default:
                        throw new ArgumentOutOfRangeException();
                        //entry["error"] = "No valid payload received.";
                        break;
                }

                output.Add(entry);
            }
            
            
            
            var json = JsonSerializer.Serialize(new
            {
                status = "ok",
                received = JsonSerializer.Serialize(output)
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
