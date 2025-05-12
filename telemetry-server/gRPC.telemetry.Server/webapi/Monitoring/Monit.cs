using System.Collections.Concurrent;

namespace webapi.Monitoring
{

    public class Monit
    {

        public int requestTimeout;
        public readonly ConcurrentDictionary<Guid, Subscriber> subscribers = new ConcurrentDictionary<Guid, Subscriber>(); // index is id in db (and in token)
        public readonly SemaphoreSlim monitorLock = new SemaphoreSlim(1, 1);
        public CancellationTokenSource cancellationTokenSource;
        public Task monitorTask;

        public void Subscribe(Subscriber sub)
        { 
            subscribers.TryAdd(sub.userID, sub);
            onSubscribe(sub);
        }

        public void Unsubscribe(Subscriber sub)
        {
            subscribers.TryRemove(sub.userID, out _);
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
                if (!subscribers.IsEmpty)
                {
                    await monitorLock.WaitAsync(token);
                    try
                    {
                        FetchData();
                        sendData();
                    }
                    finally
                    {
                        monitorLock.Release();
                    }
                }

                await Task.Delay((int)requestTimeout, token);
            }
        }

        public virtual void sendData() { }
        public virtual void FetchData() { }
        public virtual void onSubscribe(Subscriber subber) { }
        public virtual void onUnsubscribe(Subscriber subber) { }
    }
}
