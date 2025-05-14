using System.Collections.Concurrent;

namespace webapi.Models
{
    public class DeviceInfo
    {
        public DateTime LastUpdated { get; set; }
        public string Hostname { get; set; }
        public string IpAddress { get; set; }
        public Guid Uuid { get; set; }
        public string Os { get; set; }
    }

    public class NetworkDeviceInfo
    {
        public DeviceInfo DeviceInfo { get; set; }
        public string InterfaceName { get; set; }
        public double RxMbps { get; set; }
        public double TxMbps { get; set; }
    }
    public class NetworkInfoModel
    {
        public DateTime SnapshotTime { get; set; }
        public uint WarningsCount { get; set; }
        public ConcurrentDictionary<Guid, NetworkDeviceInfo> MonitoredDevices { get; set; } = new();
        public List<Guid> AutoCandidates { get; set; } = new();
    }

    public class NetworkInfo
    {
        public static NetworkInfo Instance { get; } = new NetworkInfo();

        private readonly ConcurrentDictionary<Guid, NetworkDeviceInfo> _monitoredDevices = new();
        private List<Guid> _autoCandidates = new();
        private readonly BlockingCollection<Action> _writeQueue = new();
        private readonly ReaderWriterLockSlim _rwLock = new();
        private readonly Thread _writeWorker;

        public uint WarningsCount { get; set; }

        private NetworkInfo()
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

        public void AddOrUpdateDevice(NetworkDeviceInfo device)
        {
            _writeQueue.Add(() =>
            {
                _monitoredDevices[device.DeviceInfo.Uuid] = device;
            });
        }

        public void RemoveDevice(Guid uuid)
        {
            _writeQueue.Add(() =>
            {
                _monitoredDevices.TryRemove(uuid, out _);
            });
        }

        public List<NetworkDeviceInfo> GetAllDevices()
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
        public List<Guid> GetAllDevicesUUIDs()
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

        public NetworkDeviceInfo? GetDevice(Guid uuid)
        {
            _rwLock.EnterReadLock();
            try
            {
                _monitoredDevices.TryGetValue(uuid, out var device);
                return device;
            }
            finally
            {
                _rwLock.ExitReadLock();
            }
        }

        public void CalculateBestAutoCandidates(int n)
        {
            _rwLock.EnterReadLock();
            try
            {
                _autoCandidates = _monitoredDevices
                    .Values
                    .OrderBy(device => device.RxMbps + device.TxMbps)
                    .Take(n)
                    .Select(device => device.DeviceInfo.Uuid)
                    .ToList();
            }
            finally
            {
                _rwLock.ExitReadLock();
            }
        }

        public NetworkInfoModel GetSnapshot()
        {
            _rwLock.EnterReadLock();
            try
            {
                return new NetworkInfoModel
                {
                    SnapshotTime = DateTime.Now,
                    WarningsCount = this.WarningsCount,
                    MonitoredDevices = _monitoredDevices,
                    AutoCandidates = new List<Guid>(_autoCandidates)
                };
            }
            finally
            {
                _rwLock.ExitReadLock();
            }
        }
    }
}
