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
        public static SystemInfoSnapshotHolder systemDeviceInfos { get; set; } = new();
        public override void UpdateGeneralData()
        {
            // remove the unactive devices
            SystemInfo.Instance.RemoveStaleDevices(TimeSpan.FromMinutes(5));
            // create snapshot
            systemDeviceInfos = SystemInfo.Instance.snapShot();
            // caluculate the AUTO best candidates, as well as the overall warnings and errors.
            systemDeviceInfos.CalculateBestAutoCandidates(NextAutoRequestedCount);
            systemDeviceInfos.CalculateWarnings();
            systemDeviceInfos.GetErrors();

        }
        public override string subscriberUpdateMessage(Subscriber subber)
        {
            SystemResponse nr = new SystemResponse(systemDeviceInfos.SnapshotTime);
            foreach(var device in subber.monitoredDevicesIndexes)
            {
                if (systemDeviceInfos.MonitoredDevices.TryGetValue(device, out SystemDeviceInfo deviceInfo))
                {
                    nr.monitoredDevices[device] = deviceInfo;
                }
                else
                {
                    nr.monitoredDevices[device] = null;
                }
            }

            for (int i = 0; i < (subber.autoDevicesCount < systemDeviceInfos.MonitoredDevices.Count ? subber.autoDevicesCount: systemDeviceInfos.MonitoredDevices.Count); i++)
            {
                nr.autoDevices[systemDeviceInfos.AutoCandidates[i]] = systemDeviceInfos.MonitoredDevices[systemDeviceInfos.AutoCandidates[i]];
            }

            // TODO: better error selection
            nr.errors = systemDeviceInfos.SystemErrorsDictionary;
            int warningsToGet = (systemDeviceInfos.totalWarningsCount > subber.warningCount ? systemDeviceInfos.totalWarningsCount : subber.warningCount);


            int count = 0;

            foreach (var kvp in systemDeviceInfos.SystemWarnings)
            {
                var warningCount = kvp.Value.warnings?.Count ?? 0;

                if (warningCount == 0)
                    continue;

                if (count + warningCount <= warningsToGet)
                {
                    nr.warnings.TryAdd(kvp.Key, kvp.Value);
                    count += warningCount;
                }
                else
                {
                    var partialWarnings = kvp.Value.warnings.Take(warningsToGet - count).ToList();

                    nr.warnings.TryAdd(kvp.Key, new OneDeviceSystemWarningsHolder
                    {
                        deviceInfo = kvp.Value.deviceInfo,
                        warnings = partialWarnings
                    });

                    break;
                }
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
