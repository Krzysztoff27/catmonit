using gRPC.telemetry.Server.webapi.Monitoring.Network;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using webapi.webapi;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace webapi.Monitoring
{

    public class Monit
    {
       
        public int NextAutoRequestedCount { get; set; } = 0;

        public int requestTimeout;
        public readonly List<Subscriber> subscribers = new List<Subscriber>();

        public readonly SemaphoreSlim monitorLock = new SemaphoreSlim(1, 1);
        public CancellationTokenSource cancellationTokenSource;
        public Task monitorTask;


        public void sendSimpleMsg(WebSocket ws, string msg)
        {
            byte[] msgBytes = System.Text.Encoding.UTF8.GetBytes(msg);
            var bfr = new ArraySegment<byte>(msgBytes);
            ws.SendAsync(bfr, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        public void Subscribe(Subscriber sub)
        {
            if (subscribers.Count == 0)
            {
                NetworkMonit.Instance.NextAutoRequestedCount = sub.autoDevicesCount;
                NetworkMonit.Instance.UpdateGeneralData();
            }
            subscribers.Add(sub);

            if (sub.autoDevicesCount > NextAutoRequestedCount)
            {
                NextAutoRequestedCount = sub.autoDevicesCount;
                UpdateGeneralData();
            }

            /*
            // check if user has permission to view all the requested devices
            int permissions = (int)Permissions.defaultPermission;
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
            }
            if ((permissions & (int)Permissions.seeAllPermission) != (int)Permissions.seeAllPermission)
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
            }*/

            // send cached data on devices
            string customMessage = subscriberUpdateMessage(sub);
            sendSimpleMsg(sub.WebSocket, customMessage);
            onSubscribe(sub);
        }

        public void Unsubscribe(Subscriber sub)
        {
            subscribers.Remove(sub);
            if (subscribers.Count == 0)
            {
                NextAutoRequestedCount = 0;
            }
            else if (sub.autoDevicesCount == NextAutoRequestedCount)
            {
                // recalculate auto count
                int auto = 0;
                foreach (var subscriber in subscribers)
                {
                    if (subscriber.autoDevicesCount > auto)
                        auto = subscriber.autoDevicesCount;
                }
                NextAutoRequestedCount = auto;
            }
            onUnsubscribe(sub);
        }

        public void StartMonitoring(int timeout = 5000)
        {
            if (monitorTask != null && !monitorTask.IsCompleted)
                return; // Already running
            requestTimeout = timeout;
            cancellationTokenSource = new CancellationTokenSource();
            monitorTask = Task.Run(() => MonitorLoop(cancellationTokenSource.Token));
        }

        public void StopMonitoring()
        {
            cancellationTokenSource?.Cancel();
            monitorTask?.Wait();
        }

        private async Task MonitorLoop(CancellationToken token)
        {
            while (!token.IsCancellationRequested)
            {
                await monitorLock.WaitAsync(token);
                try
                {
                    UpdateGeneralData();
                    sendData();
                }
                finally
                {
                    monitorLock.Release();
                }
                await Task.Delay((int)requestTimeout, token);
            }

        }
        public async void sendData()
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

        public virtual string subscriberUpdateMessage(Subscriber subber) { return ""; }
        public virtual void UpdateGeneralData() { }
        public virtual void onSubscribe(Subscriber subber) { }
        public virtual void onUnsubscribe(Subscriber subber) { }
    }
}
