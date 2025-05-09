using System.Net.WebSockets;
using webapi.Helpers;

namespace webapi.Monitoring
{
    public class Subscriber
    {
        public int userID { get; set; }
        public WebSocket WebSocket { get; set; }
        public List<DeviceIdentifier> monitoredDevicesIndexes; // TODO: CONCURENCY!!!!!
        public Subscriber(int userId, WebSocket webSocket, List<DeviceIdentifier> monitoredDevicesIndexes)
        {
            this.userID = userId;
            this.WebSocket = webSocket;
            this.monitoredDevicesIndexes = monitoredDevicesIndexes;
        }
    }
}
