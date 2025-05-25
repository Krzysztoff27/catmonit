using gRPC.telemetry.Server.webapi.Monitoring.Network;

namespace gRPC.telemetry.Server.webapi.Websocket.Network
{
    public class DisksMonitHandler : MonitHandler // handler just for websockets. Delegates websockets to StorageMonit
    {
        public static DisksMonitHandler instance { get; } = new DisksMonitHandler();

        DisksMonitHandler()
        {
            MonitRef = DisksMonit.Instance;
        }
    }
}
