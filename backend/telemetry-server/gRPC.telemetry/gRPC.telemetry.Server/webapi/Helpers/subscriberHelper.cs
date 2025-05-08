using webapi.Monitoring;
using System.Net.WebSockets;
using webapi.Helpers.DBconnection;


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
