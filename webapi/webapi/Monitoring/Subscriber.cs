using System.Net.WebSockets;
using webapi.Helpers;

namespace webapi.Monitoring
{
    public class Subscriber
    {
        public uint userID { get; set; }
        public WebSocket WebSocket { get; set; }
        public List<deviceIdentifier> monitoredDevicesIndexes; // TODO: CONCURENCY!!!!!
        public Subscriber(uint userId, WebSocket webSocket, List<deviceIdentifier> monitoredDevicesIndexes)
        {
            this.userID = userId;
            this.WebSocket = webSocket;
            this.monitoredDevicesIndexes = monitoredDevicesIndexes;
        }
    }
}
