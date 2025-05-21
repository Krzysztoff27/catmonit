using gRPC.telemetry.Server.webapi.Monitoring.Network;
using System.Net.WebSockets;
using webapi.webapi;

namespace webapi.Monitoring
{
    public class Monit
    {
        private readonly object _lock = new object();

        public int NextAutoRequestedCount { get; private set; } = 0;

        public int requestTimeout;
        private readonly List<Subscriber> subscribers = new List<Subscriber>();

        public readonly SemaphoreSlim monitorLock = new SemaphoreSlim(1, 1);
        public CancellationTokenSource cancellationTokenSource = new CancellationTokenSource();
        public Task monitorTask;

        public void sendSimpleMsg(WebSocket ws, string msg)
        {
            byte[] msgBytes = System.Text.Encoding.UTF8.GetBytes(msg);
            var bfr = new ArraySegment<byte>(msgBytes);
            ws.SendAsync(bfr, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        public void Subscribe(Subscriber sub)
        {
            lock (_lock)
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
            }

            string customMessage = subscriberUpdateMessage(sub);
            sendSimpleMsg(sub.WebSocket, customMessage);
            onSubscribe(sub);
        }

        public void Unsubscribe(Subscriber sub)
        {
            lock (_lock)
            {
                subscribers.Remove(sub);

                if (subscribers.Count == 0)
                {
                    NextAutoRequestedCount = 0;
                }
                else if (sub.autoDevicesCount == NextAutoRequestedCount)
                {
                    // recalculate auto count
                    NextAutoRequestedCount = subscribers.Max(s => s.autoDevicesCount);
                }
            }

            onUnsubscribe(sub);
        }

        public void StartMonitoring(int timeout = 5000)
        {
            lock (_lock)
            {
                if (monitorTask != null && !monitorTask.IsCompleted)
                    return;

                requestTimeout = timeout;
                monitorTask = Task.Run(() => MonitorLoop(cancellationTokenSource.Token));
            }
        }

        public void StopMonitoring()
        {
            lock (_lock)
            {
                cancellationTokenSource?.Cancel();
                monitorTask?.Wait();
            }
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

                await Task.Delay(requestTimeout, token);
            }
        }

        public async void sendData()
        {
            List<Subscriber> currentSubs;

            lock (_lock)
            {
                currentSubs = subscribers.ToList(); // snapshot
            }

            var tasks = currentSubs.Select(async sub =>
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
                    // ignore, not a biggie
                }
            });

            await Task.WhenAll(tasks);
        }

        public virtual string subscriberUpdateMessage(Subscriber subber) => "";
        public virtual void UpdateGeneralData() { }
        public virtual void onSubscribe(Subscriber subber) { }
        public virtual void onUnsubscribe(Subscriber subber) { }
    }
}
