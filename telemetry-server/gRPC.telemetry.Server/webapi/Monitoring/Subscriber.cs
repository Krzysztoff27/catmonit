using System.Net.WebSockets;
using webapi.Helpers;
using webapi.Helpers.DBconnection;

namespace webapi.Monitoring
{
    public class Subscriber
    {
        public Guid userID { get; set; }
        public WebSocket WebSocket { get; set; }
        public List<Guid> monitoredDevicesIndexes;
        public int autoDevicesCount { get; set; }
        public Subscriber(Guid userID, WebSocket webSocket)
        {
            this.userID = userID;
            this.WebSocket = webSocket;
            this.monitoredDevicesIndexes = new List<Guid>();
        }
    }
}
