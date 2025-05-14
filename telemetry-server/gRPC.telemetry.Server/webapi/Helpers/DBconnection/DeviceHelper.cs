using System.Collections.Generic;
using System.Data;
using webapi.webapi;

namespace gRPC.telemetry.Server.webapi.Helpers.DBconnection
{
    public class DeviceHelper
    {
        
        public static List<Guid>? GetDevicesUserHasAccessTo(Guid userID)
        {
            List<Guid> devices = new List<Guid>();
            using (var reader = ConHelper.ExecuteReader("SELECT device_id FROM users_devices where user_id = @userID;", new Dictionary<string, object> { { "@userID", userID} }))
            {
                if (reader == null) return null;

                while (reader.Read())
                {
                    devices.Add(reader.GetGuid("device_id"));
                }
            }
            return devices;
        }
        public static bool updateLastSeen(Guid deviceID)
        {
            bool? res = ConHelper.execNonQuery("UPDATE devices SET last_seen = @now where device_id = @deviceID;", new Dictionary<string, object> { { "@now", DateTime.Now }, { "@deviceID", deviceID } });
            if (res == true) return true;
            if (res == null) return false;
            return (ConHelper.execNonQuery("INSERT INTO devices (last_seen, device_id) VALUES (@now, @deviceID);", new Dictionary<string, object> { { "@now", DateTime.Now }, { "@deviceID", deviceID } }) == null ? false : true);
        }
        public static void OnDeviceDisconnected(Guid deviceID)
        {
            Utils.assert(updateLastSeen(deviceID));
        }
        public static void OnDeviceConnected(Guid deviceID)
        {
            Utils.assert(updateLastSeen(deviceID));
        }
        public static bool? RemoveUnusedDevicesAndPermissions(int tresholdDays = 14)
        {
            return ConHelper.execTransactionWithNoArgs(
                $"WITH old_devices AS (SELECT device_id FROM devices WHERE last_seen < NOW() - INTERVAL '{tresholdDays} days' FOR UPDATE) DELETE FROM user_devices WHERE device_id IN (SELECT device_id FROM old_devices);",
                $"WITH old_devices AS (SELECT device_id FROM devices WHERE last_seen < NOW() - INTERVAL '{tresholdDays} days' FOR UPDATE) DELETE FROM devices WHERE device_id IN (SELECT device_id FROM old_devices);"
                );
        }

        public static bool? DeviceExistsInDB(Guid deviceID)
        {
            int? res = ConHelper.execCountQuery("SELECT count(device_id) from devices where device_id = @devID", new Dictionary<string, object> { { "@devID", deviceID } });
            if ( res == null ) return null;
            else if ( res == 0 ) return false;
            else if ( res == 1 ) return true;
            else Utils.assert( false );
            return true;
        }
    }
}
