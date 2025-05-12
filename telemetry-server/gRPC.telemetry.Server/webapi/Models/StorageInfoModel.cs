using System.Collections.Concurrent;

namespace webapi.Models
{
    public class StorageInfoModel
    {
        public ConcurrentDictionary<Guid, storageDeviceInfo> monitoredDevices = new ConcurrentDictionary<Guid, storageDeviceInfo>();
        public string information { get; set; }
        public uint warningsCount { get; set; }
    }
    public class storageDeviceInfo
    {
        public int numUpdated = 0;
    }
}
