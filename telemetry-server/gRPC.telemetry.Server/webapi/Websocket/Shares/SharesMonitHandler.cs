using gRPC.telemetry.Server.webapi.Monitoring.Network;

namespace gRPC.telemetry.Server.webapi.Websocket.Network
{
    public class SharesMonitHandler : MonitHandler // handler just for websockets. Delegates websockets to StorageMonit
    {
        public static SharesMonitHandler instance { get; } = new SharesMonitHandler();

        SharesMonitHandler()
        {
            MonitRef = SharesMonit.Instance;
        }
    }
}
