using webapi.Monitoring;
using System.Net.WebSockets;


namespace webapi.Helpers
{
    public class subscriberHelper
    {
        public static Subscriber createSubscriber(uint userId, WebSocket webSocket)
        {
            return new Subscriber(userId, webSocket, userHelper.getDevices(userId));
        }
    }
}
