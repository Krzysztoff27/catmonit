using gRPC.telemetry.Server.Models;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class NetworkDeviceInfo
    {
        public DeviceInfo DeviceInfo { get; set; }
        public NetworkPayload MainPayload { get; set; }
        public List<NetworkPayload> Networks { get; set; }
    }
    public class NetworkInfoSnapshotHolder : ServiceContentSnapshotHolder<NetworkDeviceInfo>
    {
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
            if (MonitoredDevices.Keys.ToArray().Length != 0)
                Warnings.Add(new Warning { Device = MonitoredDevices.Keys.ToArray()[0], Message = "nothing is wrong, just testing" });
        }
        public List<(Guid deviceID, DateTime lastSeen)> GetAllDevicesUUIDsAndLastSeen()
        {
            return MonitoredDevices
                .Select(kvp => (kvp.Key, kvp.Value.DeviceInfo.LastUpdated))
                .ToList();
        }
    }
    public class NetworkInfo : ServiceContentInfo<NetworkDeviceInfo>
    {
        public static NetworkInfo Instance { get; set; } = new NetworkInfo();

        public void RemoveStaleDevices(TimeSpan staleThreshold)
        {
            base.RemoveStaleDevices(dev => dev.DeviceInfo.LastUpdated, staleThreshold);
        }
        public NetworkInfoSnapshotHolder snapShot()
        {
            NetworkInfoSnapshotHolder snapshotHolder = new();
            snapshotHolder.SnapshotTime = DateTime.UtcNow;
            snapshotHolder.MonitoredDevices = base.GetDeviceSnapshot();
            return snapshotHolder;
        }
    }
}
