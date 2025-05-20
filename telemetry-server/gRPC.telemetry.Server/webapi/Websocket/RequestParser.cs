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
        private static DeviceInfo getDeviceInfoFromResponse(ResponseModel response)
        {
            var deviceInfo = new DeviceInfo();
            deviceInfo.LastUpdated = response.Timestamp;
            deviceInfo.Hostname = response.Hostname;
            deviceInfo.IpAddress = response.IpAddress;
            deviceInfo.Uuid = Guid.Parse(response.Uuid);
            deviceInfo.Os = response.Os;
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

                        NetworkInfo.Instance.AddOrUpdateDevice(di.DeviceInfo.Uuid, di);

                        break;
                    }
                case PayloadType.Disks:
                    {
                        DisksDeviceInfo di = new DisksDeviceInfo();

                        di.DeviceInfo = getDeviceInfoFromResponse(response);

                        di.DisksInfo = (List<DiskPayload>)response.Payload;

                        DisksInfo.Instance.AddOrUpdateDevice(di.DeviceInfo.Uuid, di);

                        break;
                    }
                case PayloadType.Shares:
                    {
                        SharesDeviceInfo di = new SharesDeviceInfo();

                        di.DeviceInfo = getDeviceInfoFromResponse(response);

                        di.SharesInfo = (List<SharePayload>)response.Payload;

                        SharesInfo.Instance.AddOrUpdateDevice(di.DeviceInfo.Uuid, di);

                        break;
                    }
                case PayloadType.SystemUsage:
                    {
                        SystemDeviceInfo di = new SystemDeviceInfo();

                        di.DeviceInfo = getDeviceInfoFromResponse(response);

                        SystemUsagePayload pl = (SystemUsagePayload)response.Payload;

                        di.SystemInfo = new SystemPayload { CpuUsagePercent = pl.CpuUsagePercent, RamTotalBytes = pl.RamTotalBytes, RamUsedBytes = pl.RamUsedBytes, PagefileTotalBytes = pl.PagefileTotalBytes, PagefileUsedBytes = pl.PagefileUsedBytes, LastBootTimestamp = DateTimeOffset.FromUnixTimeSeconds((long)pl.LastBootTimestamp).DateTime };

                        SystemInfo.Instance.AddOrUpdateDevice(di.DeviceInfo.Uuid, di);

                        break;
                    }
                case PayloadType.SystemErrors:
                    {
                        SystemErrorInfo di = new SystemErrorInfo();

                        di.DeviceInfo = getDeviceInfoFromResponse(response);

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
