using gRPC.telemetry.Server.Models;
using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using gRPC.telemetry.Server.webapi.Monitoring;
using gRPC.telemetry.Server.webapi.Monitoring.Network;
using System;
using System.Net;
using System.Runtime.Intrinsics.X86;
using webapi.webapi;

namespace gRPC.telemetry.Server.webapi.Websocket
{
    public class RequestParser
    {
        static sbyte ConvertMaskToCidr(string mask)
        {
            IPAddress ip;
            if (!IPAddress.TryParse(mask, out ip))
                return 0;

            byte[] bytes = ip.GetAddressBytes();
            int count = 0;

            foreach (byte b in bytes)
            {
                for (int i = 7; i >= 0; i--)
                {
                    if ((b & (1 << i)) != 0)
                        count++;
                    else
                        break;
                }
            }

            return (sbyte)count;
        }
        public static deviceInfo getDeviceInfoFromResponse(ResponseModel response)
        {
            var deviceInfo = new deviceInfo();
            deviceInfo.lastUpdated = response.Timestamp;
            deviceInfo.hostname = response.Hostname;
            deviceInfo.ipAddress = response.IpAddress;
            deviceInfo.uuid = Guid.Parse(response.Uuid);
            deviceInfo.mask = ConvertMaskToCidr(response.IpMask);
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

                        di.deviceInfo = getDeviceInfoFromResponse(response);

                        foreach (NetworkPayload pl in (List<NetworkPayload>)response.Payload)
                        {
                            if (pl.IsMain == true)
                            {
                                di.mainPayload = pl;
                                break;
                            }
                        }
                        di.Networks = ((List<NetworkPayload>)response.Payload).Except(new List<NetworkPayload>{di.mainPayload}).ToList();

                        NetworkInfo.Instance.AddOrUpdateDevice(di.deviceInfo.uuid, di);

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

                        di.deviceInfo = getDeviceInfoFromResponse(response);

                        di.sharesInfo = (List<SharePayload>)response.Payload;

                        SharesInfo.Instance.AddOrUpdateDevice(di.deviceInfo.uuid, di);

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
            NetworkInfo.Instance.onDeviceLeave(UUID);
            SystemInfo.Instance.onDeviceLeave(UUID);
            DisksInfo.Instance.onDeviceLeave(UUID);
            SharesInfo.Instance.onDeviceLeave(UUID);
        }
    }
}
