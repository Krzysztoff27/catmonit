using System.Net.WebSockets;

namespace webapi.Monitoring
{
    public class Subscriber
    {
        static int SubInc = 0;
        public String Token { get; set; }
        public WebSocket WebSocket { get; set; }
        public Subscriber(string token, WebSocket webSocket)
        {
            Token = token;
            
            WebSocket = webSocket;
        }
    }
}
