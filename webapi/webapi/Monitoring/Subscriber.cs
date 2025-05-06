using System.Net.WebSockets;

namespace webapi.Monitoring
{
    public class Subscriber
    {
        public uint userID { get; set; }
        public WebSocket WebSocket { get; set; }
        public List<uint> monitoredDevicesIndexes; // TODO: CONCURENCY!!!!!
        public Subscriber(uint userId, WebSocket webSocket, List<uint> monitoredDevicesIndexes)
        {
            this.userID = userId;
            this.WebSocket = webSocket;
            this.monitoredDevicesIndexes = monitoredDevicesIndexes;
        }
    }
}
