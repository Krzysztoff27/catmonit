using System.Net.WebSockets;
using webapi.Helpers;
using webapi.Helpers.DBconnection;

namespace webapi.Monitoring
{
    public class Subscriber
    {
        public Guid userID { get; set; }
        public int userPermissions = (int)Permissions.defaultPermission;
        public List<Guid>? userPossibleMonitoredDevices;
        public WebSocket WebSocket { get; set; }
        public List<Guid> monitoredDevicesIndexes;
        public int autoDevicesCount { get; set; }
        public Subscriber(Guid userID, WebSocket webSocket, int permissions, List<Guid>? permittedMonitoringDevices)
        {
            this.userID = userID;
            this.WebSocket = webSocket;
            this.userPermissions = permissions;
            this.userPossibleMonitoredDevices = permittedMonitoringDevices;
            this.monitoredDevicesIndexes = new List<Guid>();
        }
    }
}
