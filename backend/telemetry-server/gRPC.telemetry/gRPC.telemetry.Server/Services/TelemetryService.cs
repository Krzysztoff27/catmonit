using System;
using System.Threading.Tasks;
using Grpc.Core;
using gRPC.telemetry; // Make sure this matches `option csharp_namespace`

public class TelemetryService : gRPC.telemetry.TelemetryService.TelemetryServiceBase
{
    public override async Task<TelemetryResponse> StreamTelemetry(
        IAsyncStreamReader<TelemetryRequest> requestStream,
        ServerCallContext context)
    {
        await foreach (var request in requestStream.ReadAllAsync())
        {
            Console.WriteLine($"[{DateTime.UtcNow}] Telemetry from {request.Hostname} ({request.IpAddress}) [{request.OperatingSystem}] UUID: {request.Uuid}");

            switch (request.PayloadCase)
            {
                case TelemetryRequest.PayloadOneofCase.Network:
                    var net = request.Network;
                    Console.WriteLine($"  Network Interface: {net.InterfaceName}");
                    Console.WriteLine($"    RX: {net.RxMbps} Mbps, TX: {net.TxMbps} Mbps");
                    if (net.InterfaceRoleCase == NetworkStats.InterfaceRoleOneofCase.IsMain && net.IsMain)
                    {
                        Console.WriteLine("    This is the main interface.");
                    }
                    break;

                case TelemetryRequest.PayloadOneofCase.Disks:
                    foreach (var disk in request.Disks.Entries)
                    {
                        Console.WriteLine($"  Disk: {disk.MountPoint}");
                        Console.WriteLine($"    Usage: {disk.Usage} / {disk.Capacity} bytes ({(disk.Capacity > 0 ? (100.0 * disk.Usage / disk.Capacity).ToString("F2") : "N/A")}%)");
                    }
                    break;

                case TelemetryRequest.PayloadOneofCase.Shares:
                    foreach (var share in request.Shares.Entries)
                    {
                        Console.WriteLine($"  File Share: {share.SharePath}");
                        Console.WriteLine($"    Usage: {share.Usage} / {share.Capacity} bytes ({(share.Capacity > 0 ? (100.0 * share.Usage / share.Capacity).ToString("F2") : "N/A")}%)");
                    }
                    break;

                case TelemetryRequest.PayloadOneofCase.None:
                default:
                    Console.WriteLine("No valid payload received in this message.");
                    break;
            }
        }

        return new TelemetryResponse
        {
            Status = "Stream received successfully."
        };
    }
}


