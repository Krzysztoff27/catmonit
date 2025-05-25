using gRPC.telemetry.Server.webapi.Monitoring.Network;

namespace gRPC.telemetry.Server.webapi.Websocket.Network
{
    public class NetworkMonitHandler : MonitHandler // handler just for websockets. Delegates websockets to NetworkMonit
    {
        public static NetworkMonitHandler instance { get; } = new NetworkMonitHandler();

        NetworkMonitHandler()
        {
            MonitRef = NetworkMonit.Instance;
        }
    }
}
