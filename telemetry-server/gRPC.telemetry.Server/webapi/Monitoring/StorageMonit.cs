using System.Net.WebSockets;
using System.Security.Cryptography.X509Certificates;
using System.Security.Policy;
using webapi.Helpers;
using webapi.Models;
using webapi.webapi;

namespace webapi.Monitoring
{
    public class StorageMonit : Monit
    {

        StorageInfoModel lastStorageInfo = new StorageInfoModel();


        public void addDevicesToMonit(List<Guid> devices_id)
        {
            foreach (Guid deviceID in devices_id)
            {
                if (!lastStorageInfo.monitoredDevices.ContainsKey(deviceID))
                {
                    storageDeviceInfo deviceInfo = new storageDeviceInfo();
                    deviceInfo.numUpdated = 0;
                    lastStorageInfo.monitoredDevices.TryAdd(deviceID, deviceInfo);
                }
            }
        }
        public void simulateDataUpdate()
        {
            foreach (storageDeviceInfo value in lastStorageInfo.monitoredDevices.Values)
            {
                value.numUpdated++;
            }
        }
        public override void FetchData()
        {
            simulateDataUpdate();
        }
        public string subscriberUpdateMessage(Subscriber subber)
        {
            string msg = "{ numberUpdates:[";
            foreach(DeviceIdentifier deviceID in subber.monitoredDevicesIndexes)
            {
                msg+= $"{{{deviceID}:{lastStorageInfo.monitoredDevices[deviceID.ID]}}},";
            }
            msg = msg.Substring(0, msg.Length - 1);
            msg += "] }";
            return msg;
        }
        public override async void sendData()
        {
            var tasks = subscribers.Values.Select(async sub =>
            {
                string customMessage = subscriberUpdateMessage(sub); // TODO: OPTIMIZE THIS !!!!!!

                byte[] messageBytes = System.Text.Encoding.UTF8.GetBytes(customMessage);
                var buffer = new ArraySegment<byte>(messageBytes);

                try
                {
                    await sub.WebSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    Utils.assert(false);
                    Console.WriteLine($"Failed to send to user {sub.userID}: {ex.Message}");
                }
            });

            await Task.WhenAll(tasks);
        }

        public override void onSubscribe(Subscriber subber)
        {
            
        }
        public override void onUnsubscribe(Subscriber subber)
        {

        }
    }
}
