using Org.BouncyCastle.Bcpg;
using System.Collections.Concurrent;

namespace webapi.Models
{
    public class StorageInfoModel
    {
        public ConcurrentDictionary<uint, storageDeviceInfo> monitoredDevices = new ConcurrentDictionary<uint, storageDeviceInfo>();
        public string information { get; set; }
        public uint warningsCount { get; set; }
        public string toString() { return information; }
    }
    public class storageDeviceInfo
    {
        public string hostname;
        public string IPadress;
        public int numUpdated;
    }
}
