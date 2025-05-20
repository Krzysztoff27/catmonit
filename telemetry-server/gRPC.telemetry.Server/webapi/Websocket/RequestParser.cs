using gRPC.telemetry.Server.Models;
using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using gRPC.telemetry.Server.webapi.Monitoring;
using gRPC.telemetry.Server.webapi.Monitoring.Network;
using System;
using webapi.webapi;

namespace gRPC.telemetry.Server.webapi.Websocket
{
    public class RequestParser
    {
        private static deviceInfo getDeviceInfoFromResponse(ResponseModel response)
        {
            var deviceInfo = new deviceInfo();
            deviceInfo.lastUpdated = response.Timestamp;
            deviceInfo.hostname = response.Hostname;
            deviceInfo.ipAddress = response.IpAddress;
            deviceInfo.uuid = Guid.Parse(response.Uuid);
            deviceInfo.os = response.Os;
            return deviceInfo;
        }
        public static void onResponseReceived(Guid deviceGUID, ResponseModel response)
        {
            switch (response.PayloadType)
            {
                case PayloadType.Network:
                    {
                        NetworkDeviceInfo di = new NetworkDeviceInfo();

                        di.DeviceInfo = getDeviceInfoFromResponse(response);

                        foreach (NetworkPayload pl in (List<NetworkPayload>)response.Payload)
                        {
                            if (pl.IsMain == true)
                            {
                                di.MainPayload = pl;
                                break;
                            }
                        }
                        di.Networks = ((List<NetworkPayload>)response.Payload).Except(new List<NetworkPayload>{di.MainPayload}).ToList();

                        NetworkInfo.Instance.AddOrUpdateDevice(di.DeviceInfo.uuid, di);

                        break;
                    }
                case PayloadType.Disks:
                    {
                        DisksDeviceInfo di = new DisksDeviceInfo();

                        di.DeviceInfo = getDeviceInfoFromResponse(response);

                        di.DisksInfo = (List<DiskPayload>)response.Payload;

                        DisksInfo.Instance.AddOrUpdateDevice(di.DeviceInfo.uuid, di);

                        break;
                    }
                case PayloadType.Shares:
                    {
                        SharesDeviceInfo di = new SharesDeviceInfo();

                        di.DeviceInfo = getDeviceInfoFromResponse(response);

                        di.SharesInfo = (List<SharePayload>)response.Payload;

                        SharesInfo.Instance.AddOrUpdateDevice(di.DeviceInfo.uuid, di);

                        break;
                    }
                case PayloadType.SystemUsage:
                    {
                        SystemDeviceInfo di = new SystemDeviceInfo();

                        di.deviceInfo = getDeviceInfoFromResponse(response);

                        SystemUsagePayload pl = (SystemUsagePayload)response.Payload;

                        di.systemInfo = new systemPayload { cpuUsagePercent = pl.CpuUsagePercent, ramTotalBytes = pl.RamTotalBytes, ramUsedBytes = pl.RamUsedBytes, pagefileTotalBytes = pl.PagefileTotalBytes, pagefileUsedBytes = pl.PagefileUsedBytes, lastBootTimestamp = DateTimeOffset.FromUnixTimeSeconds((long)pl.LastBootTimestamp).DateTime };

                        SystemInfo.Instance.AddOrUpdateDevice(di.deviceInfo.uuid, di);

                        break;
                    }
                case PayloadType.SystemErrors:
                    {
                        SystemErrorInfo di = new SystemErrorInfo();

                        di.deviceInfo = getDeviceInfoFromResponse(response);

                        di.SystemErrorsPayloads = (List<SystemErrorsPayload>)response.Payload;

                        SystemInfo.Instance.AddOrUpdateErrors(di);

                        break;
                    }
                case PayloadType.DiskErrors:
                    {
                        break;
                    }
                default:
                    {
                        Utils.assert(false);
                        break;
                    }
            }
            DeviceHelper.OnResponseGet(deviceGUID);
        }
        public static void onDisconnected(Guid UUID)
        {
            DeviceHelper.OnDeviceDisconnected(UUID);
        }
    }
}
