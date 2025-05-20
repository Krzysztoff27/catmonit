using System.Text.Json;
using webapi.Monitoring;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class SystemMonit : Monit
    {
        public static SystemMonit Instance = new SystemMonit();


        private SystemMonit() {
            StartMonitoring(5000);
        }
        public static SystemInfoSnapshotHolder storageDeviceInfos { get; set; } = new();
        public override void UpdateGeneralData()
        {
            // remove the unactive devices
            SystemInfo.Instance.RemoveStaleDevices(TimeSpan.FromMinutes(5));
            // create snapshot
            storageDeviceInfos = SystemInfo.Instance.snapShot();
            // caluculate the AUTO best candidates, as well as the overall warnings and errors.
            storageDeviceInfos.CalculateBestAutoCandidates(NextAutoRequestedCount);
            storageDeviceInfos.CalculateWarnings();
            storageDeviceInfos.GetErrors();

        }
        public override string subscriberUpdateMessage(Subscriber subber)
        {
            SystemResponse nr = new SystemResponse(storageDeviceInfos.SnapshotTime);
            foreach(var device in subber.monitoredDevicesIndexes)
            {
                if (storageDeviceInfos.MonitoredDevices.TryGetValue(device, out SystemDeviceInfo deviceInfo))
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

            // TODO: better error selection
            nr.errors = storageDeviceInfos.SystemErrorsDictionary;
            
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
