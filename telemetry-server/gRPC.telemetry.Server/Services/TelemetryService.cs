using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using gRPC.telemetry;
using gRPC.telemetry.Server.Models;
using Microsoft.Extensions.Logging;
using gRPC.telemetry.Server.webapi.Websocket;
using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using webapi.webapi;
using System.Security.Cryptography.Xml;

public class TelemetryService : gRPC.telemetry.TelemetryService.TelemetryServiceBase
{
    private readonly ILogger<TelemetryService> _logger;

    public TelemetryService(ILogger<TelemetryService> logger)
    {
        _logger = logger;
    }

    public override async Task<TelemetryResponse> StreamTelemetry(
        IAsyncStreamReader<TelemetryRequest> requestStream,
        ServerCallContext context)
    {
        var responses = new List<ResponseModel>();

        Guid guid = Guid.Empty;
        bool first = false;
        try
        {
            await foreach (var request in requestStream.ReadAllAsync())
            {
                try
                {
                    var response = new ResponseModel
                    {
                        Timestamp = DateTime.UtcNow,
                        Hostname = request.Hostname,
                        IpAddress = request.IpAddress,
                        Uuid = request.Uuid,
                        Os = request.OperatingSystem
                    };

                    
                    switch (request.PayloadCase)
                    {
                        case TelemetryRequest.PayloadOneofCase.Network:
                            response.PayloadType = PayloadType.Network;
                            response.Payload = ProcessNetworkPayload(request.Network);
                            break;

                        case TelemetryRequest.PayloadOneofCase.Disks:
                            response.PayloadType = PayloadType.Disks;
                            response.Payload = ProcessDiskPayload(request.Disks);
                            break;

                        case TelemetryRequest.PayloadOneofCase.Shares:
                            response.PayloadType = PayloadType.Shares;
                            response.Payload = ProcessSharePayload(request.Shares);
                            break;
                        
                        case TelemetryRequest.PayloadOneofCase.DiskErrors:
                            response.PayloadType = PayloadType.DiskErrors;
                            response.Payload = ProcessDiskErrorsPayload(request.DiskErrors);
                            break;

                        case TelemetryRequest.PayloadOneofCase.SystemErrors:
                            response.PayloadType = PayloadType.SystemErrors;
                            response.Payload = ProcessSystemErrorsPayload(request.SystemErrors);
                            break;

                        case TelemetryRequest.PayloadOneofCase.SystemUsage:
                            response.PayloadType = PayloadType.SystemUsage;
                            response.Payload = ProcessSystemUsagePayload(request.SystemUsage);
                            break;

                        default:
                            response.PayloadType = PayloadType.None;
                            _logger.LogWarning("Received message with no valid payload");
                            break;
                    }
                    if (guid == Guid.Empty)
                    {
                        guid = Guid.Parse(response.Uuid);
                        first = true;

                    }
                    _ = Task.Run(() =>
                    {
                        try
                        {
                            if (first)
                            {
                                DeviceHelper.OnDeviceConnected(new gRPC.telemetry.Server.webapi.Monitoring.DeviceInfo
                                {
                                    LastUpdated = response.Timestamp,
                                    Hostname = response.Hostname,
                                    IpAddress = response.IpAddress,
                                    Uuid = guid,
                                    Os = response.Os
                                });
                                first = false;
                            }
                            RequestParser.onResponseReceived(guid, response);
                        }
                        catch (Exception ex)
                        {
                            Utils.assert(false);
                            Console.WriteLine(ex.Message);
                        }
                    });

                    responses.Add(response);
                    _logger.LogInformation("Processed message from {Hostname}", request.Hostname);
                    //DEBUG
                    Console.OutputEncoding = System.Text.Encoding.UTF8;
                    Console.WriteLine(JsonSerializer.Serialize(response));
                    //DEBUG
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing individual message");
                }
            }
            
            return new TelemetryResponse 
            { 
                Status = JsonSerializer.Serialize(new
                {
                    Status = "OK",
                    Count = responses.Count,
                    Data = responses
                })
            };
        }
        catch (IOException ex)
        {
            _logger.LogInformation("Client disconnected from stream: {Message}", ex.Message);
            return new TelemetryResponse
            {
                Status = JsonSerializer.Serialize(new
                {
                    Status = "ClientDisconnected",
                    Count = responses.Count,
                    Data = responses
                })
            };
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("Stream cancelled by client.");
            return new TelemetryResponse
            {
                Status = JsonSerializer.Serialize(new
                {
                    Status = "Cancelled",
                    Count = responses.Count,
                    Data = responses
                })
            };
        }
        catch (RpcException ex) when (ex.StatusCode == StatusCode.Cancelled)
        {
            _logger.LogInformation("gRPC stream cancelled: {Message}", ex.Message);
            return new TelemetryResponse
            {
                Status = JsonSerializer.Serialize(new
                {
                    Status = "Cancelled",
                    Count = responses.Count,
                    Data = responses
                })
            };
        }
        catch (Exception ex)
        {
            // disconnect
            RequestParser.onDisconnected(guid);

            _logger.LogError(ex, "Error in StreamTelemetry");
            return new TelemetryResponse 
            { 
                Status = JsonSerializer.Serialize(new
                {
                    Status = "Error",
                    Message = ex.Message,
                    StackTrace = ex.StackTrace
                })
            };
        }
    }

    private List<NetworkPayload> ProcessNetworkPayload(NetworkStatsList networkStats)
    {
        var result = new List<NetworkPayload>();
        foreach (var entry in networkStats.Entries)
        {
            result.Add(new NetworkPayload
            {
                InterfaceName = entry.InterfaceName,
                RxMbps = entry.RxMbps,
                TxMbps = entry.TxMbps,
                IsMain = entry.InterfaceRoleCase == NetworkStats.InterfaceRoleOneofCase.IsMain ? 
                         entry.IsMain : (bool?)null
            });
        }
        return result;
    }

    private List<DiskPayload> ProcessDiskPayload(DiskStatsList diskStats)
    {
        var result = new List<DiskPayload>();
        foreach (var entry in diskStats.Entries)
        {
            result.Add(new DiskPayload
            {
                MountPoint = entry.MountPoint,
                Usage = entry.Usage,
                Capacity = entry.Capacity
            });
        }
        return result;
    }

    private List<SharePayload> ProcessSharePayload(FileSharesList shareStats)
    {
        var result = new List<SharePayload>();
        foreach (var entry in shareStats.Entries)
        {
            result.Add(new SharePayload
            {
                SharePath = entry.SharePath,
                Usage = entry.Usage,
                Capacity = entry.Capacity
            });
        }
        return result;
    }
    
    private List<DiskErrorsPayload> ProcessDiskErrorsPayload(DiskErrorsList errorStats)
    {
        var result = new List<DiskErrorsPayload>();
        foreach (var entry in errorStats.Entries)
        {
            result.Add(new DiskErrorsPayload
            {
                Message = entry.Message,
                Source = entry.Source,
                Timestamp = entry.Timestamp,
                MountPoint = entry.MountPoint
            });
        }
        return result;
    }

    private List<SystemErrorsPayload> ProcessSystemErrorsPayload(SystemErrorsList errorStats)
    {
        var result = new List<SystemErrorsPayload>();
        foreach (var entry in errorStats.Entries)
        {
            result.Add(new SystemErrorsPayload
            {
                Message = entry.Message,
                Source = entry.Source,
                Timestamp = entry.Timestamp
            });
        }
        return result;
    }

    private SystemUsagePayload ProcessSystemUsagePayload(SystemUsage entry)
    {
        return new SystemUsagePayload
        {
            CpuUsagePercent = entry.CpuUsagePercent,
            RamTotalBytes = entry.RamTotalBytes,
            RamUsedBytes = entry.RamUsedBytes,
            PagefileTotalBytes = entry.PagefileTotalBytes,
            PagefileUsedBytes = entry.PagefileUsedBytes,
            LastBootTimestamp = entry.LastBootTimestamp
        };
    }
}