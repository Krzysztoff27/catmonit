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
        public static ConcurrentDictionary<Guid, DeviceInfo> allDeviceInfos = new();
        public static List<DeviceInfo> GetDeviceInfos()
        {
            return allDeviceInfos.Values.ToList();
        }
        private static void updateLastSeen(Guid deviceID, DateTime lastSeen)
        {
            Utils.assert(allDeviceInfos.ContainsKey(deviceID));
            allDeviceInfos[deviceID].LastUpdated = lastSeen;
            /*
            bool res = ConHelper.execNonQuery("UPDATE devices SET last_seen = @now where device_id = @deviceID;", new Dictionary<string, object> { { "@now", lastSeen }, { "@deviceID", deviceID } });
            if (!res)
                ConHelper.execNonQuery("INSERT INTO devices (last_seen, device_id) VALUES (@now, @deviceID);", new Dictionary<string, object> { { "@now", lastSeen }, { "@deviceID", deviceID } });
            */
        }
        private static void UpsertDevice(DeviceInfo device)
        {
            allDeviceInfos[device.Uuid] = device;
            /*
            string sql = @"
                INSERT INTO devices (device_id, last_seen, hostname, ip_adress, os)
                VALUES (@deviceID, @lastSeen, @hostname, @ipAddress, @os)
                ON CONFLICT (device_id) DO UPDATE 
                SET last_seen = EXCLUDED.last_seen,
                    hostname = EXCLUDED.hostname,
                    ip_adress = EXCLUDED.ip_adress,
                    os = EXCLUDED.os;
            ";

                    var parameters = new Dictionary<string, object>
            {
                { "@deviceID", device.Uuid },
                { "@lastSeen", device.LastUpdated },
                { "@hostname", device.Hostname },
                { "@ipAddress", device.IpAddress },
                { "@os", device.Os }
            };

            ConHelper.execNonQuery(sql, parameters);
            */
        }
        public static void UpsertDevicesDB(List<DeviceInfo>? devices = null)
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
            sb.AppendLine("INSERT INTO devices (device_id, last_seen, hostname, ip_adress, os) VALUES ");
            var parameters = new Dictionary<string, object>();
            for (int i = 0; i < devices.Count; i++)
            {
                sb.AppendLine($"(@deviceID{i}, @lastSeen{i}, @hostname{i}, @ipAddress{i}, @os{i}){(i < devices.Count - 1 ? "," : "")}");
                parameters.Add($"@deviceID{i}", devices[i].Uuid);
                parameters.Add($"@lastSeen{i}", devices[i].LastUpdated);
                parameters.Add($"@hostname{i}", (object?)devices[i].Hostname ?? DBNull.Value);
                parameters.Add($"@ipAddress{i}", (object?)devices[i].IpAddress ?? DBNull.Value);
                parameters.Add($"@os{i}", (object?)devices[i].Os ?? DBNull.Value);
            }

            sb.AppendLine(@"
                ON CONFLICT (device_id) DO UPDATE 
                SET last_seen = EXCLUDED.last_seen,
                    hostname = EXCLUDED.hostname,
                    ip_adress = EXCLUDED.ip_adress,
                    os = EXCLUDED.os;
            ");

            ConHelper.execNonQuery(sb.ToString(), parameters);
        }
        public static void OnDeviceDisconnected(Guid device)
        {
            updateLastSeen(device, DateTime.UtcNow);
        }
        public static void OnResponseGet(Guid device)
        {
            updateLastSeen(device, DateTime.UtcNow);
        }
        public static void OnDeviceConnected(DeviceInfo device)
        {
            UpsertDevice(device);
        }
        public static bool RemoveUnusedDevices(int tresholdDays = 14)
        {

            DateTime cutoff = DateTime.UtcNow.AddDays(-tresholdDays);

            foreach (var kvp in allDeviceInfos.ToList())
            {
                if (kvp.Value.LastUpdated < cutoff)
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
        public static bool DeviceExistsInDB(Guid deviceID)
        {
            int res = ConHelper.execCountQuery("SELECT count(device_id) from devices where device_id = @devID", new Dictionary<string, object> { { "@devID", deviceID } });
            if ( res == 0 ) return false;
            else if ( res == 1 ) return true;
            else Utils.assert( false );
            return true;
        }
        public static void SynchronizeDataWithDB()
        {
            var tempDeviceInfos = new ConcurrentDictionary<Guid, DeviceInfo>();

            using (var reader = ConHelper.ExecuteReader("SELECT device_id, last_seen, hostname, ip_adress, os FROM devices;", new Dictionary<string, object>()))
            {
                while (reader.Read())
                {
                    var deviceInfo = new DeviceInfo
                    {
                        Uuid = reader.GetGuid(0),
                        LastUpdated = reader.GetDateTime(1),
                        Hostname = reader.IsDBNull(2) ? "" : reader.GetString(2),
                        IpAddress = reader.IsDBNull(3) ? "": reader.GetString(3),
                        Os = reader.IsDBNull(4) ? "": reader.GetString(4),
                    };

                    tempDeviceInfos[deviceInfo.Uuid] = deviceInfo;
                }
            }

            Interlocked.Exchange(ref allDeviceInfos, tempDeviceInfos);
        }
    }
}
