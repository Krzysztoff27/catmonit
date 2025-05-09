using webapi.Monitoring;
using System.Net.WebSockets;
using webapi.Helpers.DBconnection;


namespace webapi.Helpers
{
    public class SubscriberHelper
    {
        public static Subscriber createSubscriber(int userId, WebSocket webSocket)
        {
            return new Subscriber(userId, webSocket, userHelper.getDevices(userId));
        }
    }
}
