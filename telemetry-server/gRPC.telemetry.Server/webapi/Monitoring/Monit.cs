using System.Collections.Concurrent;

namespace webapi.Monitoring
{

    public class Monit
    {

        public int requestTimeout;
        public readonly List<Subscriber> subscribers = new List<Subscriber>(); // index is id in db (and in token)
        public readonly SemaphoreSlim monitorLock = new SemaphoreSlim(1, 1);
        public CancellationTokenSource cancellationTokenSource;
        public Task monitorTask;

        public void Subscribe(Subscriber sub)
        {
            if (subscribers.Count == 0)
            {
                NetworkMonit.Instance.NextAutoRequestedCount = sub.autoDevicesCount;
                NetworkMonit.Instance.UpdateGeneralData();
            }
                subscribers.Add( sub);
            onSubscribe(sub);
        }

        public void Unsubscribe(Subscriber sub)
        {
            subscribers.Remove(sub);
            onUnsubscribe(sub);
        }

        public void StartMonitoring(int timeout = 1000)
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

        public virtual void sendData() { }
        public virtual void UpdateGeneralData() { }
        public virtual void onSubscribe(Subscriber subber) { }
        public virtual void onUnsubscribe(Subscriber subber) { }
    }
}
