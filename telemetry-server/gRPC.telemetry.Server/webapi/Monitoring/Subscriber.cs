using System.Net.WebSockets;
using webapi.Helpers;

namespace webapi.Monitoring
{
    public class Subscriber
    {
        public Guid userID { get; set; }
        public WebSocket WebSocket { get; set; }
        public List<DeviceIdentifier> monitoredDevicesIndexes; // TODO: CONCURENCY!!!!!
        public Subscriber(Guid userID, WebSocket webSocket, List<DeviceIdentifier> monitoredDevicesIndexes)
        {
            this.userID = userID;
            this.WebSocket = webSocket;
            this.monitoredDevicesIndexes = monitoredDevicesIndexes;
        }
    }
}
