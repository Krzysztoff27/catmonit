using System.Net.WebSockets;

namespace webapi.Monitoring
{
    public class Subscriber
    {
        static int SubInc = 0;
        public string Token { get; set; }
        public WebSocket WebSocket { get; set; }
        public Subscriber(string token, WebSocket webSocket)
        {
            Token = token;
            
            WebSocket = webSocket;
        }
    }
    public class SubscriberValidator
    {
        public static Subscriber? createSubscriber(string token) {
            if (token == null || token.Length == 0)
            {
                return null;
            }

            return null;
        }
    }
}
