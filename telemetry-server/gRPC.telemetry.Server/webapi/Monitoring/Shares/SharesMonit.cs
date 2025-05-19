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
        public static SharesInfoSnapshotHolder storageDeviceInfos { get; set; } = new();
        public override void UpdateGeneralData()
        {
            // remove the unactive devices
            SharesInfo.Instance.RemoveStaleDevices(TimeSpan.FromMinutes(5));
            // create snapshot
            storageDeviceInfos = SharesInfo.Instance.snapShot();
            // caluculate the AUTO best candidates, as well as the overall warnings and errors.
            storageDeviceInfos.CalculateBestAutoCandidates(NextAutoRequestedCount);
            storageDeviceInfos.CalculateWarnings();
            storageDeviceInfos.GetErrors();

        }
        public override string subscriberUpdateMessage(Subscriber subber)
        {
            SharesResponse nr = new SharesResponse(storageDeviceInfos.SnapshotTime);
            foreach(var device in subber.monitoredDevicesIndexes)
            {
                if (storageDeviceInfos.MonitoredDevices.TryGetValue(device, out SharesDeviceInfo deviceInfo))
                {
                    nr.monitoredDevices[device] = deviceInfo;
                }
                else
                {
                    nr.monitoredDevices[device] = null;
                }
            }

            for (int i = 0; i < (subber.autoDevicesCount < storageDeviceInfos.MonitoredDevices.Count ? subber.autoDevicesCount: storageDeviceInfos.MonitoredDevices.Count); i++)
            {
                nr.autoDevices[storageDeviceInfos.AutoCandidates[i]] = storageDeviceInfos.MonitoredDevices[storageDeviceInfos.AutoCandidates[i]];
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
