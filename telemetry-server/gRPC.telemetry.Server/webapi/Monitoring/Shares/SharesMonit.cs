using System.Text.Json;
using webapi.Monitoring;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class SharesMonit : Monit
    {
        public static SharesMonit Instance = new SharesMonit();


        private SharesMonit() {
            StartMonitoring(15000);
        }
        public static SharesInfoSnapshotHolder sharesDeviceInfos { get; set; } = new();
        public override void UpdateGeneralData()
        {
            // remove the unactive devices
            SharesInfo.Instance.RemoveStaleDevices(TimeSpan.FromMinutes(5));
            // create snapshot
            sharesDeviceInfos = SharesInfo.Instance.snapShot();
            // caluculate the AUTO best candidates, as well as the overall warnings and errors.
            sharesDeviceInfos.CalculateBestAutoCandidates(NextAutoRequestedCount);
            sharesDeviceInfos.CalculateWarnings();
            sharesDeviceInfos.GetErrors();

        }
        public override string subscriberUpdateMessage(Subscriber subber)
        {
            SharesResponse nr = new SharesResponse(sharesDeviceInfos.SnapshotTime);
            foreach(var device in subber.monitoredDevicesIndexes)
            {
                if (sharesDeviceInfos.MonitoredDevices.TryGetValue(device, out SharesDeviceInfo deviceInfo))
                {
                    nr.monitoredDevices[device] = deviceInfo;
                }
                else
                {
                    nr.monitoredDevices[device] = null;
                }
            }

            for (int i = 0; i < (subber.autoDevicesCount < sharesDeviceInfos.MonitoredDevices.Count ? subber.autoDevicesCount: sharesDeviceInfos.MonitoredDevices.Count); i++)
            {
                nr.autoDevices[sharesDeviceInfos.AutoCandidates[i]] = sharesDeviceInfos.MonitoredDevices[sharesDeviceInfos.AutoCandidates[i]];
            }
            
            return JsonSerializer.Serialize(nr);
        }
        
        public override void onSubscribe(Subscriber subber)
        {
        }
        public override void onUnsubscribe(Subscriber subber)
        {

        }
    }
}
