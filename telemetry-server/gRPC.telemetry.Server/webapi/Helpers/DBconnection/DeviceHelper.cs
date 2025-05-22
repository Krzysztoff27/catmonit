using gRPC.telemetry.Server.webapi.Monitoring;
using Npgsql;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Text;
using webapi.webapi;

namespace gRPC.telemetry.Server.webapi.Helpers.DBconnection
{
    public class DeviceHelper
    {
        public static ConcurrentDictionary<Guid, deviceInfo> allDeviceInfos = new();
        public static Dictionary<Guid, deviceInfo> GetDeviceInfos()
        {
            return allDeviceInfos.ToDictionary();
        }
        private static void updateLastSeen(Guid deviceID, DateTime lastSeen)
        {
            Utils.assert(allDeviceInfos.ContainsKey(deviceID));
            allDeviceInfos[deviceID].lastUpdated = lastSeen;
        }
        private static void UpsertDevice(deviceInfo device)
        {
            allDeviceInfos[device.uuid] = device;
        }
        public static void UpsertDevicesDB(List<deviceInfo>? devices = null)
        {
            if (devices == null)
            {
                devices = allDeviceInfos.Values.ToList();
            }
            if (devices.Count == 0)
            {
                return;
            }
            var sb = new StringBuilder();
            sb.AppendLine("INSERT INTO devices (device_id, last_seen, hostname, ip_adress, network_mask, os) VALUES ");
            var parameters = new Dictionary<string, object>();
            for (int i = 0; i < devices.Count; i++)
            {
                sb.AppendLine($"(@deviceID{i}, @lastSeen{i}, @hostname{i}, @ipAddress{i}, @networkMask{i}, @os{i}){(i < devices.Count - 1 ? "," : "")}");
                parameters.Add($"@deviceID{i}", devices[i].uuid);
                parameters.Add($"@lastSeen{i}", devices[i].lastUpdated);
                parameters.Add($"@hostname{i}", (object?)devices[i].hostname ?? DBNull.Value);
                parameters.Add($"@ipAddress{i}", (object?)devices[i].ipAddress ?? DBNull.Value);
                parameters.Add($"@networkMask{i}", (object?)(Int16)devices[i].mask ?? DBNull.Value);
                parameters.Add($"@os{i}", (object?)devices[i].os ?? DBNull.Value);
            }

            sb.AppendLine(@"
                ON CONFLICT (device_id) DO UPDATE 
                SET last_seen = EXCLUDED.last_seen,
                    hostname = EXCLUDED.hostname,
                    ip_adress = EXCLUDED.ip_adress,
                    network_mask = EXCLUDED.network_mask,
                    os = EXCLUDED.os;
            ");

            ConHelper.execNonQuery(sb.ToString(), parameters);
        }
        public static void OnDeviceDisconnected(Guid device)
        {
            updateLastSeen(device, DateTime.UtcNow);
        }
        public static void OnDeviceConnected(deviceInfo device)
        {
            UpsertDevice(device);
        }
        public static void OnResponseGet(Guid device)
        {
            updateLastSeen(device, DateTime.UtcNow);
        }
        public static bool RemoveUnusedDevices(int tresholdDays = 14)
        {

            DateTime cutoff = DateTime.UtcNow.AddDays(-tresholdDays);

            foreach (var kvp in allDeviceInfos.ToList())
            {
                if (kvp.Value.lastUpdated < cutoff)
                {
                    allDeviceInfos.TryRemove(kvp.Key, out _);
                }
            }

            try
            {
                return ConHelper.execNonQuery(
                    $"DELETE FROM devices WHERE last_seen < NOW() - INTERVAL '{tresholdDays} days';",
                    new Dictionary<string, object>()
                );
            }
            catch (InternalServerError)
            {
                // ignore 
                return false;
            }
        }
        public static void SynchronizeDataWithDB()
        {
            try
            {
                var tempDeviceInfos = new ConcurrentDictionary<Guid, deviceInfo>();

                using (var reader = ConHelper.ExecuteReader("SELECT device_id, last_seen, hostname, ip_adress, os FROM devices;", new Dictionary<string, object>()))
                {
                    while (reader.Read())
                    {
                        var deviceInfo = new deviceInfo
                        {
                            uuid = reader.GetGuid(0),
                            lastUpdated = reader.GetDateTime(1),
                            hostname = reader.IsDBNull(2) ? "" : reader.GetString(2),
                            ipAddress = reader.IsDBNull(3) ? "" : reader.GetString(3),
                            os = reader.IsDBNull(4) ? "" : reader.GetString(4),
                        };

                        tempDeviceInfos[deviceInfo.uuid] = deviceInfo;
                    }
                }

                Interlocked.Exchange(ref allDeviceInfos, tempDeviceInfos);
            }
            catch (InternalServerError) 
            { 
                // ignore
            }
        }
    }
}
