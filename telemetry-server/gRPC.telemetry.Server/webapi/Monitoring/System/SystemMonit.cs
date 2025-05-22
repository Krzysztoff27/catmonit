using System.Text.Json;
using webapi.Monitoring;
using webapi.webapi;

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
            try
            {
                SystemResponse nr = new SystemResponse(systemDeviceInfos.SnapshotTime);
                foreach (var device in subber.monitoredDevicesIndexes)
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

                for (int i = 0; i < (subber.autoDevicesCount < systemDeviceInfos.MonitoredDevices.Count ? subber.autoDevicesCount : systemDeviceInfos.MonitoredDevices.Count); i++)
                {
                    nr.autoDevices[systemDeviceInfos.AutoCandidates[i]] = systemDeviceInfos.MonitoredDevices[systemDeviceInfos.AutoCandidates[i]];
                }





                int countErr = 0;

                foreach (var kvp in systemDeviceInfos.SystemErrorsDictionary)
                {
                    var errorCount = kvp.Value.SystemErrorsPayloads?.Count ?? 0;

                    if (errorCount == 0)
                        continue;

                    nr.errors.TryAdd(kvp.Key, kvp.Value);
                    countErr += errorCount;
                    if (countErr >= subber.errorCount) break;
                }





                int count = 0;

                foreach (var kvp in systemDeviceInfos.SystemWarnings)
                {
                    var warningCount = kvp.Value.warnings?.Count ?? 0;

                    if (warningCount == 0)
                        continue;

                    nr.warnings.TryAdd(kvp.Key, kvp.Value);
                    count += warningCount;

                    if (count >= subber.warningCount) break;
                }


                nr.totalWarningCount = systemDeviceInfos.totalWarningCount;
                nr.totalErrorCount = systemDeviceInfos.totalErrorCount;

                return JsonSerializer.Serialize(nr, Utils.JsonOption);
            }
            catch (Exception e)
            {
                Console.WriteLine($"user: {subber.userID}, autocount: {subber.autoDevicesCount}, error count: {subber.errorCount}, error:{e.Message}");
                return "";
            }
        }
        
        public override void onSubscribe(Subscriber subber)
        {
        }
        public override void onUnsubscribe(Subscriber subber)
        {

        }
    }
}
