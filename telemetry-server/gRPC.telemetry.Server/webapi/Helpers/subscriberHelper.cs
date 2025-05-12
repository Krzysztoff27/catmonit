using webapi.Monitoring;
using System.Net.WebSockets;
using webapi.Helpers.DBconnection;


namespace webapi.Helpers
{
    public class SubscriberHelper
    {
        public static Subscriber createSubscriber(Guid userID, WebSocket webSocket)
        {
            return new Subscriber(userID, webSocket, userHelper.getDevices(userID));
        }
    }
}
