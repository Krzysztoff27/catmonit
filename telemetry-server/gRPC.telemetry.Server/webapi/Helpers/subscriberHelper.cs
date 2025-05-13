using webapi.Monitoring;
using System.Net.WebSockets;
using webapi.Helpers.DBconnection;


namespace webapi.Helpers
{
    public class SubscriberHelper
    {
        public static Subscriber createSubscriber(Guid userID, WebSocket webSocket)
        {
            int? perms = PermissionHelper.UserPermission(userID);
            return new Subscriber(
                userID, 
                webSocket, 
                (perms.HasValue) ? perms.Value:(int)Permissions.defaultPermission, 
                DeviceHelper.GetDevicesUserHasAccessTo(userID)
                );
        }
    }
}
