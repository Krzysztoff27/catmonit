using System.Text.Json;
using webapi.Monitoring;
using webapi.webapi;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class NetworkMonit : Monit
    {
        public static NetworkMonit Instance = new NetworkMonit();


        private NetworkMonit() {
            StartMonitoring(5000);
        }
        public static NetworkInfoSnapshotHolder networkDeviceInfos { get; set; } = new();
        public override void UpdateGeneralData()
        {
            // remove the unactive devices
            NetworkInfo.Instance.RemoveStaleDevices(TimeSpan.FromMinutes(5));
            // create snapshot
            networkDeviceInfos = NetworkInfo.Instance.snapShot();
            // caluculate the AUTO best candidates, as well as the overall warnings and errors.
            networkDeviceInfos.CalculateBestAutoCandidates(NextAutoRequestedCount);
            networkDeviceInfos.CalculateWarnings();

        }
        public override string subscriberUpdateMessage(Subscriber subber)
        {
            NetworkResponse nr = new NetworkResponse(networkDeviceInfos.SnapshotTime);
            foreach(var device in subber.monitoredDevicesIndexes)
            {
                if (networkDeviceInfos.MonitoredDevices.TryGetValue(device, out NetworkDeviceInfo deviceInfo))
                {
                    nr.monitoredDevices[device] = deviceInfo;
                }
                else
                {
                    nr.monitoredDevices[device] = null;
                }
            }

            for (int i = 0; i < (subber.autoDevicesCount < networkDeviceInfos.MonitoredDevices.Count ? subber.autoDevicesCount: networkDeviceInfos.MonitoredDevices.Count); i++)
            {
                nr.autoDevices[networkDeviceInfos.AutoCandidates[i]] = networkDeviceInfos.MonitoredDevices[networkDeviceInfos.AutoCandidates[i]];
            }
            
            return JsonSerializer.Serialize(nr, Utils.JsonOption);
        }
        
        public override void onSubscribe(Subscriber subber)
        {
        }
        public override void onUnsubscribe(Subscriber subber)
        {

        }
    }
}
