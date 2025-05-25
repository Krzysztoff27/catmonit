using System.Collections.Concurrent;
using System.Text.Json;
using webapi.Monitoring;
using webapi.webapi;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class DisksMonit : Monit
    {
        public static DisksMonit Instance = new DisksMonit();


        private DisksMonit() {
            StartMonitoring(15000);
        }
        public static DisksInfoSnapshotHolder diskDeviceInfos { get; set; } = new();
        public override void UpdateGeneralData()
        {
            // remove the unactive devices
            DisksInfo.Instance.RemoveStaleDevices(TimeSpan.FromMinutes(5));
            // create snapshot
            diskDeviceInfos = DisksInfo.Instance.snapShot();
            // caluculate the AUTO best candidates, as well as the overall warnings and errors.
            diskDeviceInfos.CalculateBestAutoCandidates(NextAutoRequestedCount);
            diskDeviceInfos.CalculateWarnings();

        }
        public override string subscriberUpdateMessage(Subscriber subber)
        {
            DisksResponse nr = new DisksResponse(diskDeviceInfos.SnapshotTime);
            foreach(var device in subber.monitoredDevicesIndexes)
            {
                if (diskDeviceInfos.MonitoredDevices.TryGetValue(device, out DisksDeviceInfo deviceInfo))
                {
                    nr.monitoredDevices[device] = deviceInfo;
                }
                else
                {
                    nr.monitoredDevices[device] = null;
                }
            }

            for (int i = 0; i < (subber.autoDevicesCount < diskDeviceInfos.MonitoredDevices.Count ? subber.autoDevicesCount: diskDeviceInfos.MonitoredDevices.Count); i++)
            {
                nr.autoDevices[diskDeviceInfos.AutoCandidates[i]] = diskDeviceInfos.MonitoredDevices[diskDeviceInfos.AutoCandidates[i]];
            }
            if (diskDeviceInfos.DiskWarnings.Count != 0)
            {
                nr.warnings = new ConcurrentDictionary<Guid, OneDeviceDiskWarningsHolder>(
                    diskDeviceInfos.DiskWarnings.Take(subber.warningCount)
                );
            }


            if (subber.errorCount > 0)
            {
                int countErr = 0;

                foreach (var kvp in diskDeviceInfos.DiskErrorsDictionary)
                {
                    var errorCount = kvp.Value.DiskErrorsPayloads?.Count ?? 0;

                    if (errorCount == 0)
                        continue;

                    nr.errors.TryAdd(kvp.Key, kvp.Value);
                    countErr += errorCount;
                    if (countErr >= subber.errorCount) break;
                }
            }


            if (subber.warningCount > 0)
            {
                int count = 0;

                foreach (var kvp in diskDeviceInfos.DiskWarnings)
                {
                    var warningCount = kvp.Value.warnings?.Count ?? 0;

                    if (warningCount == 0)
                        continue;

                    nr.warnings.TryAdd(kvp.Key, kvp.Value);
                    count += warningCount;

                    if (count >= subber.warningCount) break;
                }
            }



            nr.totalErrorCount = diskDeviceInfos.totalErrorCount;
            nr.totalWarningCount = diskDeviceInfos.totalWarningCount;

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
