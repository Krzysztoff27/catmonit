using gRPC.telemetry.Server.Models;
using System.Collections.Concurrent;

namespace webapi.Models
{
    public enum Severity
    {
        Warning,
        Error
    }
    public class WarningError
    {
        public Severity Severity { get; set; }
        public string Message { get; set; }
    }
    public class DeviceInfo
    {
        public DateTime LastUpdated { get; set; }
        public string Hostname { get; set; }
        public string IpAddress { get; set; }
        public Guid Uuid { get; set; }
        public string Os { get; set; }
    }
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
    public class NetworkDeviceInfo
    {
        public DeviceInfo DeviceInfo { get; set; }
        public NetworkPayload MainPayload { get; set; }
        public List<NetworkPayload> Networks { get; set; }
    }
    public class NetworkInfoModel
    {
        public DateTime SnapshotTime { get; set; }
        public Dictionary<Guid, List<WarningError>> Warnings { get; set; }
        public ConcurrentDictionary<Guid, NetworkDeviceInfo> MonitoredDevices { get; set; } = new();
        public List<Guid> AutoCandidates { get; set; } = new();

        public static double RxMbpsWarningTreshold = 0; // treshold for warnings (this or below will throw a warnings)
        public static double TxMbpsWarningTreshold = 0; // treshold for warnings (this or below will throw a warnings)

        public void CalculateBestAutoCandidates(int n)
        {
            AutoCandidates = MonitoredDevices
                .Values
                .OrderBy(device => device.MainPayload.RxMbps + device.MainPayload.TxMbps)
                .Take(n)
                .Select(device => device.DeviceInfo.Uuid)
                .ToList();
        }
        public void CalculateWarnings()
        {
            /*
            Warnings.Clear();
            foreach(var device in MonitoredDevices)
            {
                if (device.Value.TxMbps <= TxMbpsWarningTreshold || device.Value.RxMbps <= RxMbpsWarningTreshold) {
                    if (!Warnings.TryGetValue(device.Key, out var warningList))
                    {
                        warningList = new List<WarningError>();
                        Warnings[device.Key] = warningList;
                    }

                    if (device.Value.RxMbps <= RxMbpsWarningTreshold) {
                        warningList.Add(new WarningError
                        {
                            Severity = Severity.Warning,
                            Message = $"RxMbps is low: {device.Value.RxMbps}"
                        });
                    }


                    if (device.Value.TxMbps <= TxMbpsWarningTreshold)
                    {
                        Warnings[device.Key].Add(new WarningError 
                        { 
                            Severity = Severity.Warning, 
                            Message = $"TxMbps is low: {device.Value.TxMbps}" 
                        });
                    }
                }
            }
            */
        }

    }

    public class NetworkInfo
    {
        public static NetworkInfo Instance { get; } = new NetworkInfo();

        private readonly ConcurrentDictionary<Guid, NetworkDeviceInfo> _monitoredDevices = new();
        private readonly BlockingCollection<Action> _writeQueue = new();
        private readonly ReaderWriterLockSlim _rwLock = new();
        private readonly Thread _writeWorker;


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
        public List<(Guid id, DateTime last_seen)> GetAllDevicesUUIDsAndLastSeen()
        {
            _rwLock.EnterReadLock();
            try
            {
                return _monitoredDevices
                    .Select(kv => (kv.Key, kv.Value.DeviceInfo.LastUpdated))
                    .ToList();
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

        public NetworkInfoModel GetSnapshot()
        {
            _rwLock.EnterReadLock();
            try
            {
                return new NetworkInfoModel
                {
                    SnapshotTime = DateTime.UtcNow,
                    MonitoredDevices = _monitoredDevices
                };
            }
            finally
            {
                _rwLock.ExitReadLock();
            }
        }

        public void RemoveStaleDevices(TimeSpan staleThreshold)
        {
            var cutoffTime = DateTime.UtcNow - staleThreshold;

            _rwLock.EnterWriteLock();
            try
            {
                foreach (var kvp in _monitoredDevices)
                {
                    var lastSeen = kvp.Value.DeviceInfo.LastUpdated;
                    if (lastSeen < cutoffTime)
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
    }
}
