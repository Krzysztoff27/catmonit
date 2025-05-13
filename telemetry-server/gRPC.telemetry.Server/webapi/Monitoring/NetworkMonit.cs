using Microsoft.AspNetCore.SignalR;
using System;
using System.Net.WebSockets;
using System.Numerics;
using System.Security.Cryptography.X509Certificates;
using System.Security.Policy;
using System.Text.Json;
using System.Threading.Tasks;
using webapi.Helpers;
using webapi.Models;
using webapi.webapi;

namespace webapi.Monitoring
{
    public class NetworkResponse
    {
        public int montoredDevicesCount = 0;
        public List<NetworkDeviceInfo> monitoredDevices = new();
        public int autoDevicesCount = 0;
        public List<NetworkDeviceInfo> autoDevicse = new();
    }
    public class NetworkMonit : Monit
    {
        public static NetworkMonit Instance = new NetworkMonit();

        private NetworkMonit() {
            StartMonitoring();
        }

        static NetworkInfoModel networkDeviceInfos = new();
        public override void UpdateGeneralData()
        {
            // caluculate the AUTO best candidates, as well as the overall warnings and errors.
            
            NetworkInfo.Instance.CalculateBestAutoCandidates(10);

            // create snapshot
            networkDeviceInfos = NetworkInfo.Instance.GetSnapshot(); 
        }
        public string subscriberUpdateMessage(Subscriber subber)// TODO: Make it return only the data on devices the user is subscribed to
        {
            NetworkResponse nr = new NetworkResponse();
            for (int i = 0; i < (subber.autoDevicesCount<networkDeviceInfos.MonitoredDevices.Count? subber.autoDevicesCount: networkDeviceInfos.MonitoredDevices.Count); i++)

            {
                nr.autoDevicesCount++;
                nr.autoDevicse.Add(networkDeviceInfos.MonitoredDevices[networkDeviceInfos.AutoCandidates[i]]);
            }
            
            return JsonSerializer.Serialize(nr);
        }
        public override async void sendData()
        {
            var tasks = subscribers.Values.Select(async sub =>
            {
                string customMessage = subscriberUpdateMessage(sub); 

                byte[] messageBytes = System.Text.Encoding.UTF8.GetBytes(customMessage);
                var buffer = new ArraySegment<byte>(messageBytes);

                try
                {
                    await sub.WebSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    Utils.assert(false);
                }
            });

            await Task.WhenAll(tasks);
        }

        public override void onSubscribe(Subscriber subber)
        {
            string customMessage = subscriberUpdateMessage(subber);
            byte[] messageBytes = System.Text.Encoding.UTF8.GetBytes(customMessage);
            var buffer = new ArraySegment<byte>(messageBytes);
            subber.WebSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }
        public override void onUnsubscribe(Subscriber subber)
        {

        }
    }
}
