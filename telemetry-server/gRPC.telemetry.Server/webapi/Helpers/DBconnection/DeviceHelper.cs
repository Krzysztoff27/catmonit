using System.Collections.Generic;
using System.Data;
using webapi.webapi;

namespace gRPC.telemetry.Server.webapi.Helpers.DBconnection
{
    public class DeviceHelper
    {
        /*
        public static List<Guid> GetDevicesUserHasAccessTo(Guid userID)
        {
            List<Guid> devices = new List<Guid>();
            using (var reader = ConHelper.ExecuteReader("SELECT device_id FROM users_devices where user_id = @userID;", new Dictionary<string, object> { { "@userID", userID } }))
            {
                if (reader == null) return devices;

                while (reader.Read())
                {
                    devices.Add(reader.GetGuid("device_id"));
                }
            }
            return devices;
        }*/
        public static List<Guid> getAllDevicesIDs ()
        {
            List<Guid> devices = new List<Guid>();
            using (var reader = ConHelper.ExecuteReader("SELECT device_id FROM devices", new Dictionary<string, object> {}))
            {
                if (reader == null) return devices;

                while (reader.Read())
                {
                    devices.Add(reader.GetGuid("device_id"));
                }
            }
            return devices;
        }
        public static void updateLastSeen(Guid deviceID, DateTime lastSeen)
        {
            bool res = ConHelper.execNonQuery("UPDATE devices SET last_seen = @now where device_id = @deviceID;", new Dictionary<string, object> { { "@now", lastSeen }, { "@deviceID", deviceID } });
            if (!res)
                ConHelper.execNonQuery("INSERT INTO devices (last_seen, device_id) VALUES (@now, @deviceID);", new Dictionary<string, object> { { "@now", lastSeen }, { "@deviceID", deviceID } });
        }
        public static void OnDeviceDisconnected(Guid deviceID)
        {
            updateLastSeen(deviceID, DateTime.UtcNow);
        }
        public static void OnDeviceConnected(Guid deviceID)
        {
            updateLastSeen(deviceID, DateTime.UtcNow);
        }
        public static bool RemoveUnusedDevicesAndPermissions(int tresholdDays = 14)
        {
            try
            {
                return ConHelper.execNonQuery($"DELETE FROM devices WHERE last_seen < NOW() - INTERVAL '{tresholdDays} days';", new Dictionary<string, object>());
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
    }
}
