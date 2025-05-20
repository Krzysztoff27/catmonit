using gRPC.telemetry.Server.webapi.Monitoring.Network;
using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring
{
    public abstract class ServiceContentInfo<TDevice>
    where TDevice : class
    {
        private readonly ConcurrentDictionary<Guid, TDevice> _monitoredDevices = new();
        private readonly BlockingCollection<Action> _writeQueue = new();
        private readonly ReaderWriterLockSlim _rwLock = new();
        private readonly Thread _writeWorker;

        protected ServiceContentInfo()
        {
            _writeWorker = new Thread(ProcessWriteQueue) { IsBackground = true };
            _writeWorker.Start();
        }

        private void ProcessWriteQueue()
        {
            foreach (var action in _writeQueue.GetConsumingEnumerable())
            {
                _rwLock.EnterWriteLock();
                try
                {
                    action();
                }
                finally
                {
                    _rwLock.ExitWriteLock();
                }
            }
        }

        public void AddOrUpdateDevice(Guid id, TDevice device)
        {
            _writeQueue.Add(() =>
            {
                _monitoredDevices[id] = device;
                onDeviceUpsert(device);
            });
        }

        public void RemoveDevice(Guid id)
        {
            _writeQueue.Add(() =>
            {
                _monitoredDevices.TryRemove(id, out _);
                onDeviceLeave(id);
            });
        }

        public List<TDevice> GetAllDevices()
        {
            _rwLock.EnterReadLock();
            try
            {
                return _monitoredDevices.Values.ToList();
            }
            finally
            {
                _rwLock.ExitReadLock();
            }
        }

        public List<Guid> GetAllDeviceIds()
        {
            _rwLock.EnterReadLock();
            try
            {
                return _monitoredDevices.Keys.ToList();
            }
            finally
            {
                _rwLock.ExitReadLock();
            }
        }

        public TDevice? GetDevice(Guid id)
        {
            _rwLock.EnterReadLock();
            try
            {
                _monitoredDevices.TryGetValue(id, out var device);
                return device;
            }
            finally
            {
                _rwLock.ExitReadLock();
            }
        }

        public Dictionary<Guid, TDevice> GetDeviceSnapshot()
        {
            _rwLock.EnterReadLock();
            try
            {
                return new Dictionary<Guid, TDevice>(_monitoredDevices);
            }
            finally
            {
                _rwLock.ExitReadLock();
            }
        }

        public void RemoveStaleDevices(Func<TDevice, DateTime> getLastUpdated, TimeSpan staleThreshold)
        {
            var cutoff = DateTime.UtcNow - staleThreshold;

            _rwLock.EnterWriteLock();
            try
            {
                foreach (var kvp in _monitoredDevices)
                {
                    if (getLastUpdated(kvp.Value) < cutoff)
                    {
                        _monitoredDevices.TryRemove(kvp.Key, out _);
                    }
                }
            }
            finally
            {
                _rwLock.ExitWriteLock();
            }
        }
        public virtual void onDeviceUpsert(TDevice device) { }
        public virtual void onDeviceLeave(Guid deviceID) { }
    }

    public abstract class ServiceContentSnapshotHolder<TDevice>
   where TDevice : class
    {
        public DateTime SnapshotTime { get; set; }
        public Dictionary<Guid, TDevice> MonitoredDevices { get; set; } = new();
        public List<Guid> AutoCandidates { get; set; } = new();
    }
}
