using System.Text.Json;
using webapi.Monitoring;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class DisksMonit : Monit
    {
        public static DisksMonit Instance = new DisksMonit();


        private DisksMonit() {
            StartMonitoring(15000);
        }
        public static DisksInfoSnapshotHolder storageDeviceInfos { get; set; } = new();
        public override void UpdateGeneralData()
        {
            // remove the unactive devices
            DisksInfo.Instance.RemoveStaleDevices(TimeSpan.FromMinutes(5));
            // create snapshot
            storageDeviceInfos = DisksInfo.Instance.snapShot();
            // caluculate the AUTO best candidates, as well as the overall warnings and errors.
            storageDeviceInfos.CalculateBestAutoCandidates(NextAutoRequestedCount);
            storageDeviceInfos.CalculateWarnings();

        }
        public override string subscriberUpdateMessage(Subscriber subber)
        {
            DisksResponse nr = new DisksResponse(storageDeviceInfos.SnapshotTime);
            foreach(var device in subber.monitoredDevicesIndexes)
            {
                if (storageDeviceInfos.MonitoredDevices.TryGetValue(device, out DisksDeviceInfo deviceInfo))
                {
                    nr.monitoredDevices[device] = deviceInfo;
                }
                else
                {
                    nr.monitoredDevices[device] = null;
                }
            }
            nr.warnings = storageDeviceInfos.Warnings;
            nr.errors = storageDeviceInfos.Errors;

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
