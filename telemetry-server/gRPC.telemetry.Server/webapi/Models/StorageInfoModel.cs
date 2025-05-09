using System.Collections.Concurrent;

namespace webapi.Models
{
    public class StorageInfoModel
    {
        public ConcurrentDictionary<int, storageDeviceInfo> monitoredDevices = new ConcurrentDictionary<int, storageDeviceInfo>();
        public string information { get; set; }
        public uint warningsCount { get; set; }
    }
    public class storageDeviceInfo
    {
        public int numUpdated = 0;
    }
}
