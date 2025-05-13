using gRPC.telemetry.Server.webapi.Helpers.DBconnection;
using System.Collections.Generic;
using System.Data;

namespace webapi.Helpers
{
    public class DeviceHelper
    {
        
        public static List<Guid> GetDevicesUserHasAccessTo(Guid userID)
        {
            List<Guid> devices = new List<Guid>();
            using (var reader = ConHelper.ExecuteReader("SELECT device_id FROM users_devices where user_id = @userID;", new Dictionary<string, object> { { "@userID", userID} }))
            {
                if (reader == null) return devices;

                while (reader.Read())
                {
                    devices.Add(reader.GetGuid("device_id"));
                }
            }
            return devices;
        }
    }
}
