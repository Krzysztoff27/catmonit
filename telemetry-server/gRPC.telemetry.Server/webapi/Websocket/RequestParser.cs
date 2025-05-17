using gRPC.telemetry.Server.Models;
using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using gRPC.telemetry.Server.webapi.Monitoring;
using gRPC.telemetry.Server.webapi.Monitoring.Network;

namespace gRPC.telemetry.Server.webapi.Websocket
{
    public class RequestParser
    {
        public static void onResponseReceived(Guid deviceGUID, ResponseModel response)
        {
            switch (response.PayloadType)
            {
                case PayloadType.Network:
                    {
                        NetworkDeviceInfo di = new NetworkDeviceInfo();

                        di.DeviceInfo = new DeviceInfo();
                        di.DeviceInfo.LastUpdated = response.Timestamp;
                        di.DeviceInfo.Hostname = response.Hostname;
                        di.DeviceInfo.IpAddress = response.IpAddress;
                        di.DeviceInfo.Uuid = Guid.Parse(response.Uuid);
                        di.DeviceInfo.Os = response.Os;

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

                        return;
                    }
                    
            }
        }
        public static void onDisconnected(Guid UUID)
        {
            DeviceHelper.OnDeviceDisconnected(UUID);
        }
    }
}
