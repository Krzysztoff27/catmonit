using Microsoft.AspNetCore.SignalR;
using System;
using System.Net.WebSockets;
using System.Numerics;
using System.Security.Cryptography.X509Certificates;
using System.Security.Policy;
using System.Text.Json;
using System.Threading.Tasks;
using webapi.Helpers;
using webapi.Helpers.DBconnection;
using webapi.Models;
using webapi.webapi;

namespace webapi.Monitoring
{
    public class NetworkResponse
    {
        public int montoredDevicesCount { get; set; } = 0;
        public List<NetworkDeviceInfo> monitoredDevices { get; set; } = new();
        public int autoDevicesCount { get; set; } = 0;
        public List<NetworkDeviceInfo> autoDevices { get; set; } = new();
    }
    public class NetworkMonit : Monit
    {
        public static NetworkMonit Instance = new NetworkMonit();

        private NetworkMonit() {
            StartMonitoring(5000);
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

            for (int i = 0; i < ((subber.autoDevicesCount < networkDeviceInfos.MonitoredDevices.Count) ? subber.autoDevicesCount: networkDeviceInfos.MonitoredDevices.Count); i++)
            {
                nr.autoDevicesCount++;
                nr.autoDevices.Add(networkDeviceInfos.MonitoredDevices[networkDeviceInfos.AutoCandidates[i]]);
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
            // check if user has permission to view all the requested devices
            if ((subber.userPermissions & (int)Permissions.seeAllPermission) != (int)Permissions.seeAllPermission)
            {
                var missing = subber.monitoredDevicesIndexes.Where(item => !subber.userPossibleMonitoredDevices.Contains(item)).ToList();
                if (missing.Count != 0)
                {

                    string msg = JsonSerializer.Serialize(new { message = "User doesn't have permission to see all the requested items.", items = missing });
                    byte[] msgBytes = System.Text.Encoding.UTF8.GetBytes(msg);
                    var bfr = new ArraySegment<byte>(msgBytes);
                    subber.WebSocket.SendAsync(bfr, WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
            // send cached data on devices
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
