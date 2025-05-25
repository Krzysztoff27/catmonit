using gRPC.telemetry.Server.webapi.Monitoring.Network;

namespace gRPC.telemetry.Server.webapi.Websocket.Network
{
    public class SystemMonitHandler : MonitHandler // handler just for websockets. Delegates websockets to SystemMonit
    {
        public static SystemMonitHandler instance { get; } = new SystemMonitHandler();

        SystemMonitHandler()
        {
            MonitRef = SystemMonit.Instance;
        }
    }
}
