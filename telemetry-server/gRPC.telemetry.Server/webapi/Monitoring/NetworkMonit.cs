using gRPC.telemetry.Server.webapi;
using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Numerics;
using System.Reflection;
using System.Security.Cryptography.X509Certificates;
using System.Security.Policy;
using System.Text.Json;
using System.Threading.Tasks;
using System.Timers;
using webapi.Helpers;
using webapi.Helpers.DBconnection;
using webapi.Models;
using webapi.webapi;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace webapi.Monitoring
{
    public class NetworkResponse
    {
        public NetworkResponse()
        {
            responseTime = DateTime.UtcNow;
        }
        public DateTime responseTime { get; set; }
        public ConcurrentDictionary<Guid, NetworkDeviceInfo?> monitoredDevices { get; set; } = new();
        public ConcurrentDictionary<Guid, NetworkDeviceInfo> autoDevices { get; set; } = new();
    }
    public class NetworkMonit : Monit
    {
        public static NetworkMonit Instance = new NetworkMonit();

        public int NextAutoRequestedCount { get; set; } = 0;

        private NetworkMonit() {
            StartMonitoring(5000);
        }

        public static NetworkInfoModel networkDeviceInfos { get; set; } = new();
        public override void UpdateGeneralData()
        {
            // remove the unactive devices
            NetworkInfo.Instance.RemoveStaleDevices(TimeSpan.FromMinutes(5));
            // create snapshot
            networkDeviceInfos = NetworkInfo.Instance.GetSnapshot();

            // caluculate the AUTO best candidates, as well as the overall warnings and errors.
            networkDeviceInfos.CalculateBestAutoCandidates(NextAutoRequestedCount);
            networkDeviceInfos.CalculateWarnings();

        }
        public string subscriberUpdateMessage(Subscriber subber)// TODO: Make it return only the data on devices the user is subscribed to
        {
            NetworkResponse nr = new NetworkResponse();
            foreach(var device in subber.monitoredDevicesIndexes)
            {
                if (networkDeviceInfos.MonitoredDevices.TryGetValue(device, out NetworkDeviceInfo deviceInfo))
                {
                    nr.monitoredDevices[device] = deviceInfo;
                }
                else
                {
                    nr.monitoredDevices[device] = null;
                }
            }

            for (int i = 0; i < ((subber.autoDevicesCount < networkDeviceInfos.MonitoredDevices.Count) ? subber.autoDevicesCount: networkDeviceInfos.MonitoredDevices.Count); i++)
            {
                nr.autoDevices[networkDeviceInfos.AutoCandidates[i]] = (networkDeviceInfos.MonitoredDevices[networkDeviceInfos.AutoCandidates[i]]);
            }
            
            return JsonSerializer.Serialize(nr);
        }
        public override async void sendData()
        {
            var tasks = subscribers.Select(async sub =>
            {
                string customMessage = subscriberUpdateMessage(sub); 

                byte[] messageBytes = System.Text.Encoding.UTF8.GetBytes(customMessage);
                var buffer = new ArraySegment<byte>(messageBytes);

                try
                {
                    await sub.WebSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
                }
                catch (Exception)
                {
                    Utils.assert(false);
                }
            });

            await Task.WhenAll(tasks);
        }
        private void sendSimpleMsg(WebSocket ws, string msg)
        {
            byte[] msgBytes = System.Text.Encoding.UTF8.GetBytes(msg);
            var bfr = new ArraySegment<byte>(msgBytes);
            ws.SendAsync(bfr, WebSocketMessageType.Text, true, CancellationToken.None);
        }
        public override void onSubscribe(Subscriber subber)
        {
            if (subber.autoDevicesCount> NextAutoRequestedCount)
            {
                NextAutoRequestedCount = subber.autoDevicesCount;
                UpdateGeneralData();
            }
            // check if user has permission to view all the requested devices
            /*int permissions = (int)Permissions.defaultPermission;
            try
            {
                int? perms;
                perms = PermissionHelper.UserPermission(subber.userID);
                if (perms == null)
                {
                    string message = JsonSerializer.Serialize(new { message= "user doesn't exist"});
                    sendSimpleMsg(subber.WebSocket, message);
                }
                else
                {
                    permissions = perms.Value;
                }
            }
            catch (InternalServerError)
            {
                // ignore
            }*/
            /*if ((permissions & (int)Permissions.seeAllPermission) != (int)Permissions.seeAllPermission)
            {

                try
                {
                    List<Guid> canBeAccessedDevices = DeviceHelper.GetDevicesUserHasAccessTo(subber.userID);
                    var missing = subber.monitoredDevicesIndexes.Where(item => !canBeAccessedDevices.Contains(item)).ToList();
                    subber.monitoredDevicesIndexes = subber.monitoredDevicesIndexes.Except(missing).ToList();

                    string message = JsonSerializer.Serialize(new { message = "You don't have permissions to view all the requested devices", missing = missing });
                    sendSimpleMsg(subber.WebSocket, message);
                }
                catch (InternalServerError)
                {
                    subber.monitoredDevicesIndexes.Clear();
                    subber.autoDevicesCount = 0;
                    string message = JsonSerializer.Serialize(new { message = "Internal server error. Cannot check permissions- assuming you have none >:3" });
                    sendSimpleMsg(subber.WebSocket, message);
                }
            }
            */

            // send cached data on devices
            string customMessage = subscriberUpdateMessage(subber);
            sendSimpleMsg(subber.WebSocket, customMessage);
        }
        public override void onUnsubscribe(Subscriber subber)
        {

        }
    }
}
