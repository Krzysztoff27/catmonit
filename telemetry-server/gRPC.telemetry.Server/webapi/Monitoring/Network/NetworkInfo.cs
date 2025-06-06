﻿using gRPC.telemetry.Server.Models;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class NetworkDeviceInfo
    {
        public deviceInfo deviceInfo { get; set; }
        public NetworkPayload mainPayload { get; set; }
        public List<NetworkPayload> Networks { get; set; }
    }
    public class NetworkInfoSnapshotHolder : ServiceContentSnapshotHolder<NetworkDeviceInfo>
    {

        public void CalculateBestAutoCandidates(int n)
        {
            AutoCandidates = MonitoredDevices
                .Values
                .OrderBy(device => device.mainPayload.RxMbps + device.mainPayload.TxMbps)
                .Take(n)
                .Select(device => device.deviceInfo.uuid)
                .ToList();
        }
        public void CalculateWarnings()
        {

        }
        public List<(Guid deviceID, DateTime lastSeen)> GetAllDevicesUUIDsAndLastSeen()
        {
            return MonitoredDevices
                .Select(kvp => (kvp.Key, kvp.Value.deviceInfo.lastUpdated))
                .ToList();
        }
    }
    public class NetworkInfo : ServiceContentInfo<NetworkDeviceInfo>
    {
        public static NetworkInfo Instance { get; set; } = new NetworkInfo();

        public void RemoveStaleDevices(TimeSpan staleThreshold)
        {
            base.RemoveStaleDevices(dev => dev.deviceInfo.lastUpdated, staleThreshold);
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
