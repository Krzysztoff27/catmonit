using gRPC.telemetry.Server.Models;
using System.Collections.Concurrent;

namespace gRPC.telemetry.Server.webapi.Monitoring.Network
{
    public class Tresholds
    {
        public const int CPUwarningTresholdValue = 85; // precent
        public const int RAMwarningTresholdValue = 85; // percent
        public const int warningTresholdTime = 5; // times 
    }
    public class HistoricalSingleWarningInfo
    {
        public int timesCPUover85 = 0;
        public int timesRamUsageover85percent = 0;
    }

    public class SystemDeviceInfo
    {
        public deviceInfo deviceInfo { get; set; }
        public systemPayload SystemInfo { get; set; }
    }

    public class SystemErrorInfo
    {
        public deviceInfo deviceInfo { get; set; }
        public List<SystemErrorsPayload> SystemErrorsPayloads { get; set; }
    }
    public class OneDeviceWarningsHolder
    {
        public deviceInfo deviceInfo { get; set; }
        public List<string> Warnings { get; set; }
    }

    public class SystemInfoSnapshotHolder : ServiceContentSnapshotHolder<SystemDeviceInfo>
    {
        public int totalWarningsCount = 0;
        public ConcurrentDictionary<Guid, SystemErrorInfo> SystemErrorsDictionary { get; set; } = new();
        public ConcurrentDictionary<Guid, HistoricalSingleWarningInfo> SystemHistoricalData { get; set; }
        public ConcurrentDictionary<Guid, OneDeviceWarningsHolder> SystemWarnings { get; set; } = new();
        public void CalculateBestAutoCandidates(int n)
        {
            AutoCandidates = MonitoredDevices
                .Values
                .OrderByDescending(device => device.SystemInfo.ramTotalBytes)
                .Take(n)
                .Select(device => device.deviceInfo.uuid)
                .ToList();
        }
        public void CalculateWarnings()
        {
            totalWarningsCount = 0;
            SystemWarnings = new();
            foreach((Guid id, HistoricalSingleWarningInfo historicalInfo) in SystemHistoricalData)
            {
                if (historicalInfo.timesCPUover85 > Tresholds.warningTresholdTime)
                {
                    if (SystemWarnings.TryGetValue(id, out var warning))
                    {
                        warning.Warnings.Add($"CPU usage is high ({MonitoredDevices[id].SystemInfo.cpuUsagePercent}%).");
                    }
                    else
                    {
                        SystemWarnings[id] = new OneDeviceWarningsHolder { deviceInfo= MonitoredDevices[id].deviceInfo, Warnings = new List<string>{ $"CPU usage is high ({MonitoredDevices[id].SystemInfo.cpuUsagePercent}%)." } };
                    }
                    totalWarningsCount++;
                }

                if (historicalInfo.timesRamUsageover85percent > Tresholds.warningTresholdTime)
                {
                    if (SystemWarnings.TryGetValue(id, out var warning))
                    {
                        warning.Warnings.Add($"RAM usage is high ({(float)MonitoredDevices[id].SystemInfo.ramUsedBytes / (float)MonitoredDevices[id].SystemInfo.ramTotalBytes * 100}%).");
                    }
                    else
                    {
                        SystemWarnings.TryAdd(id, new OneDeviceWarningsHolder { deviceInfo = MonitoredDevices[id].deviceInfo, Warnings = new List<string> { $"RAM usage is high ({(float)MonitoredDevices[id].SystemInfo.ramUsedBytes / (float)MonitoredDevices[id].SystemInfo.ramTotalBytes * 100}%)." } });
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
        public ConcurrentDictionary<Guid, HistoricalSingleWarningInfo> historicalWarningInfo { get; set; } = new();
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
            snapshotHolder.SystemHistoricalData = historicalWarningInfo;
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
            if (device.SystemInfo.cpuUsagePercent > Tresholds.CPUwarningTresholdValue)
            {
                if (historicalWarningInfo.TryGetValue(device.deviceInfo.uuid, out HistoricalSingleWarningInfo val))
                {
                    val.timesCPUover85++;
                }
                else
                {
                    historicalWarningInfo.TryAdd(device.deviceInfo.uuid, new HistoricalSingleWarningInfo { timesCPUover85 = 1 });
                }
            }
            else
            {
                if (historicalWarningInfo.TryGetValue(device.deviceInfo.uuid, out HistoricalSingleWarningInfo val))
                {
                    val.timesCPUover85 = 0;
                }
                else
                {
                    historicalWarningInfo.TryAdd(device.deviceInfo.uuid, new HistoricalSingleWarningInfo());
                }
            }

            float RAMusage = ((float)device.SystemInfo.ramUsedBytes / (float)device.SystemInfo.ramTotalBytes)*100;
            if (RAMusage > Tresholds.RAMwarningTresholdValue)
            { 
                historicalWarningInfo[device.deviceInfo.uuid].timesRamUsageover85percent++;
                if (historicalWarningInfo.TryGetValue(device.deviceInfo.uuid, out HistoricalSingleWarningInfo val))
                {
                    val.timesRamUsageover85percent++;
                }
                else
                {
                    historicalWarningInfo.TryAdd(device.deviceInfo.uuid, new HistoricalSingleWarningInfo { timesRamUsageover85percent = 1 });
                }
            }
            else
            {

                if (historicalWarningInfo.TryGetValue(device.deviceInfo.uuid, out HistoricalSingleWarningInfo val))
                {
                    val.timesRamUsageover85percent = 0;
                }
                else
                {
                    historicalWarningInfo.TryAdd(device.deviceInfo.uuid, new HistoricalSingleWarningInfo());
                }
            }
        }
        public override void onDeviceLeave(Guid deviceID)
        {
            historicalWarningInfo.TryRemove(deviceID, out _);
        }

    }
}
