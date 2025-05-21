using gRPC.telemetry.Server.Models;
using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class TresholdsSystem
    {
        public const int CPUwarningTresholdValue = 85; // precent
        public const int RAMwarningTresholdValue = 85; // percent
        public const int warningTresholdTimes = 5; // times 
    }
    public class SingleDeviceHistoricalSystemInfo
    {
        public int timesCPUover85 = 0;
        public int timesRamUsageover85percent = 0;
    }

    public class SystemDeviceInfo
    {
        public deviceInfo deviceInfo { get; set; }
        public systemPayload systemInfo { get; set; }
    }

    public class SystemErrorInfo
    {
        public deviceInfo deviceInfo { get; set; }
        public List<SystemErrorsPayload> SystemErrorsPayloads { get; set; }
    }
    public class OneDeviceSystemWarningsHolder
    {
        public deviceInfo deviceInfo { get; set; }
        public List<string> warnings { get; set; }
    }

    public class SystemInfoSnapshotHolder : ServiceContentSnapshotHolder<SystemDeviceInfo>
    {
        public int totalWarningsCount = 0;
        public ConcurrentDictionary<Guid, SystemErrorInfo> SystemErrorsDictionary { get; set; } = new();
        public ConcurrentDictionary<Guid, SingleDeviceHistoricalSystemInfo> AllDevicesHistoricalSystemInfo { get; set; }
        public ConcurrentDictionary<Guid, OneDeviceSystemWarningsHolder> SystemWarnings { get; set; } = new();
        public void CalculateBestAutoCandidates(int n)
        {
            var AutoCandidates = MonitoredDevices
            .Values
            .OrderByDescending(device => (device.systemInfo.cpuUsagePercent *1f) + (((float)device.systemInfo.ramUsedBytes / (float)device.systemInfo.ramTotalBytes)*70f))
            .Take(n)
            .Select(device => device.deviceInfo.uuid)
            .ToList();
        }
        public void CalculateWarnings()
        {
            totalWarningsCount = 0;
            SystemWarnings = new();
            foreach((Guid id, SingleDeviceHistoricalSystemInfo historicalInfo) in AllDevicesHistoricalSystemInfo)
            {
                if (historicalInfo.timesCPUover85 > TresholdsSystem.warningTresholdTimes)
                {
                    if (SystemWarnings.TryGetValue(id, out var warning))
                    {
                        warning.warnings.Add($"CPU usage is high ({MonitoredDevices[id].systemInfo.cpuUsagePercent}%).");
                    }
                    else
                    {
                        SystemWarnings[id] = new OneDeviceSystemWarningsHolder { deviceInfo= MonitoredDevices[id].deviceInfo, warnings = new List<string>{ $"CPU usage is high ({MonitoredDevices[id].systemInfo.cpuUsagePercent}%)." } };
                    }
                    totalWarningsCount++;
                }

                if (historicalInfo.timesRamUsageover85percent > TresholdsSystem.warningTresholdTimes)
                {
                    if (SystemWarnings.TryGetValue(id, out var warning))
                    {
                        warning.warnings.Add($"RAM usage is high ({(float)MonitoredDevices[id].systemInfo.ramUsedBytes / (float)MonitoredDevices[id].systemInfo.ramTotalBytes * 100}%).");
                    }
                    else
                    {
                        SystemWarnings.TryAdd(id, new OneDeviceSystemWarningsHolder { deviceInfo = MonitoredDevices[id].deviceInfo, warnings = new List<string> { $"RAM usage is high ({(float)MonitoredDevices[id].systemInfo.ramUsedBytes / (float)MonitoredDevices[id].systemInfo.ramTotalBytes * 100}%)." } });
                    }
                    totalWarningsCount++;
                }
            }
        }
        public void GetErrors()
        {

        }
    }
    public class SystemInfo : ServiceContentInfo<SystemDeviceInfo>
    {
        public ConcurrentDictionary<Guid, SingleDeviceHistoricalSystemInfo> historicalWarningInfo { get; set; } = new();
        public ConcurrentDictionary<Guid, SystemErrorInfo> SystemErrorsDictionary { get; set; } = new();
        public static SystemInfo Instance { get; set; } = new SystemInfo();

        public void RemoveStaleDevices(TimeSpan staleThreshold)
        {
            base.RemoveStaleDevices(dev => dev.deviceInfo.lastUpdated, staleThreshold);

            // Cutoff time
            var cutoffTime = DateTimeOffset.UtcNow - staleThreshold;
            var cutoffUnixTimestamp = cutoffTime.ToUnixTimeMilliseconds();

            // Clean up errors
            foreach (var entry in SystemErrorsDictionary)
            {
                var errorInfo = entry.Value;
                if (errorInfo?.SystemErrorsPayloads != null)
                {
                    errorInfo.SystemErrorsPayloads = errorInfo.SystemErrorsPayloads
                        .Where(payload => payload.Timestamp >= cutoffUnixTimestamp)
                        .ToList();
                }
            }
        }
        public SystemInfoSnapshotHolder snapShot()
        {
            SystemInfoSnapshotHolder snapshotHolder = new();
            snapshotHolder.SnapshotTime = DateTime.UtcNow;
            snapshotHolder.MonitoredDevices = base.GetDeviceSnapshot();
            snapshotHolder.SystemErrorsDictionary = SystemErrorsDictionary;
            snapshotHolder.AllDevicesHistoricalSystemInfo = historicalWarningInfo;
            return snapshotHolder;
        }
        public void AddOrUpdateErrors(SystemErrorInfo error)
        {
            var uuid = error.deviceInfo.uuid;

            SystemErrorsDictionary.AddOrUpdate(uuid,
                error,
                (key, existingError) =>
                {
                    existingError.deviceInfo = error.deviceInfo;

                    if (existingError.SystemErrorsPayloads == null)
                        existingError.SystemErrorsPayloads = new List<SystemErrorsPayload>();

                    if (error.SystemErrorsPayloads != null)
                    {
                        foreach (var payload in error.SystemErrorsPayloads)
                        {
                            if (!existingError.SystemErrorsPayloads.Contains(payload))
                            {
                                existingError.SystemErrorsPayloads.Add(payload);
                            }
                        }
                    }

                    return existingError;
                });
        }
        public override void onDeviceUpsert(SystemDeviceInfo device)
        {
            if (device.systemInfo.cpuUsagePercent > TresholdsSystem.CPUwarningTresholdValue)
            {
                if (historicalWarningInfo.TryGetValue(device.deviceInfo.uuid, out SingleDeviceHistoricalSystemInfo val))
                {
                    val.timesCPUover85++;
                }
                else
                {
                    historicalWarningInfo.TryAdd(device.deviceInfo.uuid, new SingleDeviceHistoricalSystemInfo { timesCPUover85 = 1 });
                }
            }
            else
            {
                if (historicalWarningInfo.TryGetValue(device.deviceInfo.uuid, out SingleDeviceHistoricalSystemInfo val))
                {
                    val.timesCPUover85 = 0;
                }
                else
                {
                    historicalWarningInfo.TryAdd(device.deviceInfo.uuid, new SingleDeviceHistoricalSystemInfo());
                }
            }

            float RAMusage = ((float)device.systemInfo.ramUsedBytes / (float)device.systemInfo.ramTotalBytes)*100;
            if (RAMusage > TresholdsSystem.RAMwarningTresholdValue)
            { 
                historicalWarningInfo[device.deviceInfo.uuid].timesRamUsageover85percent++;
                if (historicalWarningInfo.TryGetValue(device.deviceInfo.uuid, out SingleDeviceHistoricalSystemInfo val))
                {
                    val.timesRamUsageover85percent++;
                }
                else
                {
                    historicalWarningInfo.TryAdd(device.deviceInfo.uuid, new SingleDeviceHistoricalSystemInfo { timesRamUsageover85percent = 1 });
                }
            }
            else
            {

                if (historicalWarningInfo.TryGetValue(device.deviceInfo.uuid, out SingleDeviceHistoricalSystemInfo val))
                {
                    val.timesRamUsageover85percent = 0;
                }
                else
                {
                    historicalWarningInfo.TryAdd(device.deviceInfo.uuid, new SingleDeviceHistoricalSystemInfo());
                }
            }
        }
        public override void onDeviceLeave(Guid deviceID)
        {
            historicalWarningInfo.TryRemove(deviceID, out _);
        }

    }
}
