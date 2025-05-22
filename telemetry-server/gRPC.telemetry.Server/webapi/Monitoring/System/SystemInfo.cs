using gRPC.telemetry.Server.Models;
using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class TresholdsSystem
    {
        public const int CPUwarningTresholdValue = 85; // precent
        public const int RAMwarningTresholdValue = 85; // percent
        public const int warningTresholdTimes = 5; // times 
        public static TimeSpan errorCutoffTime = TimeSpan.FromDays(1);
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
    
    public class SystemErrorsPayloadWithNormalTimestamp
    {
        public string Message { get; set; }
        public string Source { get; set; }
        public DateTime Timestamp { get; set; }

        public override bool Equals(object obj)
        {
            if (obj is not SystemErrorsPayloadWithNormalTimestamp other)
                return false;

            return Message == other.Message && Source == other.Source && Timestamp == other.Timestamp;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Message, Source, Timestamp);
        }
    }

    public class SystemErrorInfo
    {
        public deviceInfo deviceInfo { get; set; }
        public List<SystemErrorsPayloadWithNormalTimestamp> SystemErrorsPayloads { get; set; }
    }
    public class OneDeviceSystemWarningsHolder
    {
        public deviceInfo deviceInfo { get; set; }
        public List<string> warnings { get; set; }
    }

    public class SystemInfoSnapshotHolder : ServiceContentSnapshotHolder<SystemDeviceInfo>
    {
        public int totalWarningCount = 0;
        public int totalErrorCount = 0;
        public ConcurrentDictionary<Guid, SystemErrorInfo> SystemErrorsDictionary { get; set; } = new();
        public ConcurrentDictionary<Guid, SingleDeviceHistoricalSystemInfo> AllDevicesHistoricalSystemInfo { get; set; }
        public ConcurrentDictionary<Guid, OneDeviceSystemWarningsHolder> SystemWarnings { get; set; } = new();
        public void CalculateBestAutoCandidates(int n)
        {
            AutoCandidates = MonitoredDevices
            .Values
            .OrderByDescending(device => (device.systemInfo.cpuUsagePercent *1f) + (((float)device.systemInfo.ramUsedBytes / (float)device.systemInfo.ramTotalBytes)*70f))
            .Take(n)
            .Select(device => device.deviceInfo.uuid)
            .ToList();
        }
        public void CalculateWarnings()
        {
            totalWarningCount = 0;
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
                    totalWarningCount++;
                }

                if (historicalInfo.timesRamUsageover85percent > TresholdsSystem.warningTresholdTimes)
                {
                    if (SystemWarnings.TryGetValue(id, out var warning))
                    {
                        warning.warnings.Add($"RAM usage is high ({Math.Round((float)MonitoredDevices[id].systemInfo.ramUsedBytes / (float)MonitoredDevices[id].systemInfo.ramTotalBytes * 100)}%).");
                    }
                    else
                    {
                        SystemWarnings.TryAdd(id, new OneDeviceSystemWarningsHolder { deviceInfo = MonitoredDevices[id].deviceInfo, warnings = new List<string> { $"RAM usage is high ({Math.Round((float)MonitoredDevices[id].systemInfo.ramUsedBytes / (float)MonitoredDevices[id].systemInfo.ramTotalBytes * 100)}%)." } });
                    }
                    totalWarningCount++;
                }
            }
        }
        public void GetErrors()
        {

        }
    }
    public class SystemInfo : ServiceContentInfo<SystemDeviceInfo>
    {
        public int totalErrorCount { get; set; } = 0;
        public ConcurrentDictionary<Guid, SingleDeviceHistoricalSystemInfo> historicalWarningInfo { get; set; } = new();
        public ConcurrentDictionary<Guid, SystemErrorInfo> SystemErrorsDictionary { get; set; } = new();
        public static SystemInfo Instance { get; set; } = new SystemInfo();

        public void RemoveStaleDevices(TimeSpan staleThreshold)
        {
            base.RemoveStaleDevices(dev => dev.deviceInfo.lastUpdated, staleThreshold);

            // Cutoff time
            var cutoffTime = DateTimeOffset.UtcNow - TresholdsSystem.errorCutoffTime;

            var keysToRemove = new List<Guid>();

            int removedErrors = 0;
            // Clean up errors
            foreach (var entry in SystemErrorsDictionary)
            {
                var key = entry.Key;
                var errorInfo = entry.Value;

                if (errorInfo?.SystemErrorsPayloads != null)
                {
                    var errorCountBefore = errorInfo.SystemErrorsPayloads.Count;
                    errorInfo.SystemErrorsPayloads = errorInfo.SystemErrorsPayloads
                        .Where(payload => payload.Timestamp >= cutoffTime)
                        .ToList();
                    removedErrors += errorCountBefore - errorInfo.SystemErrorsPayloads.Count;
                    if (!errorInfo.SystemErrorsPayloads.Any())
                    {
                        keysToRemove.Add(key);
                    }
                }
            }
            totalErrorCount -= removedErrors;

            // Remove SystemErrorInfos with no payloads
            foreach (var key in keysToRemove)
            {
                SystemErrorsDictionary.TryRemove(key, out _);
            }

        }
        public SystemInfoSnapshotHolder snapShot()
        {
            SystemInfoSnapshotHolder snapshotHolder = new();
            snapshotHolder.SnapshotTime = DateTime.UtcNow;
            snapshotHolder.MonitoredDevices = base.GetDeviceSnapshot();
            snapshotHolder.SystemErrorsDictionary = SystemErrorsDictionary;
            snapshotHolder.AllDevicesHistoricalSystemInfo = historicalWarningInfo;
            snapshotHolder.totalErrorCount = totalErrorCount;
            return snapshotHolder;
        }
        public void AddOrUpdateErrors(SystemErrorInfo error)
        {
            var uuid = error.deviceInfo.uuid;
            int insertedCount = 0;

            SystemErrorsDictionary.AddOrUpdate(uuid,
                addValueFactory: key =>
                {
                    // New entry, count all payloads
                    if (error.SystemErrorsPayloads != null)
                    {
                        insertedCount = error.SystemErrorsPayloads.Count;
                    }

                    return new SystemErrorInfo
                    {
                        deviceInfo = error.deviceInfo,
                        SystemErrorsPayloads = error.SystemErrorsPayloads != null
                            ? new List<SystemErrorsPayloadWithNormalTimestamp>(error.SystemErrorsPayloads)
                            : new List<SystemErrorsPayloadWithNormalTimestamp>()
                    };
                },
                updateValueFactory: (key, existingError) =>
                {
                    existingError.deviceInfo = error.deviceInfo;

                    if (existingError.SystemErrorsPayloads == null)
                        existingError.SystemErrorsPayloads = new List<SystemErrorsPayloadWithNormalTimestamp>();

                    if (error.SystemErrorsPayloads != null)
                    {
                        foreach (var payload in error.SystemErrorsPayloads)
                        {
                            if (!existingError.SystemErrorsPayloads.Contains(payload))
                            {
                                existingError.SystemErrorsPayloads.Add(payload);
                                insertedCount++;
                            }
                        }
                    }

                    return existingError;
                });

            totalErrorCount += insertedCount;
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
