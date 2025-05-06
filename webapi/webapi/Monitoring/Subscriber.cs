using System.Net.WebSockets;

namespace webapi.Monitoring
{
    public class Subscriber
    {
        public uint userID { get; set; }
        public WebSocket WebSocket { get; set; }
        public Subscriber(uint userId, WebSocket webSocket)
        {
            userID = userId;
            WebSocket = webSocket;
        }
    }
}
