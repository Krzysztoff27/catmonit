import { Alert, DisksErrorInfo, SystemErrorInfo, WarningInfo } from "../../../types/api.types";
import { safeObjectValues } from "../../../utils/object";

export const getAllAlertData = (settings, hiddenIds, getData) => {
    let newCount = {
        errors: 0,
        warnings: 0,
    };

    const getDisksErrors = (disksErrors: Record<string, DisksErrorInfo>) =>
        safeObjectValues(disksErrors).reduce(
            (prev: Alert[], errorInfo: DisksErrorInfo) => [
                ...prev,
                ...errorInfo.disksErrorsPayloads.map(({ mountPoint, message, timestamp }) => ({
                    message: `[${mountPoint}] ${message}`,
                    deviceInfo: errorInfo.deviceInfo,
                    isWarning: false,
                    id: `${errorInfo.deviceInfo.uuid}:::${message}:::${timestamp}`,
                })),
            ],
            []
        );

    const getSystemErrors = (systemErrors: Record<string, SystemErrorInfo>) =>
        safeObjectValues(systemErrors).reduce(
            (prev: Alert[], errorInfo: SystemErrorInfo) => [
                ...prev,
                ...errorInfo.systemErrorsPayloads.map(({ message, timestamp }) => ({
                    message,
                    deviceInfo: errorInfo.deviceInfo,
                    isWarning: false,
                    id: `${errorInfo.deviceInfo.uuid}:::${message}:::${timestamp}`,
                })),
            ],
            []
        );

    const getWarnings = (warnings: Record<string, WarningInfo>) =>
        safeObjectValues(warnings).reduce(
            (prev: Alert[], warningInfo: WarningInfo) => [
                ...prev,
                ...warningInfo.warnings.map(
                    (message: string) =>
                        ({
                            message,
                            deviceInfo: warningInfo.deviceInfo,
                            isWarning: true,
                            id: `${warningInfo.deviceInfo.uuid}:::${message}:::now`,
                        } as Alert)
                ),
            ],
            []
        );

    const combinedAlerts = (settings?.sources ?? []).reduce(
        (prev, source: string) => {
            const data = getData(source);

            const fallback = () => [];
            const getErrorsFunction =
                {
                    storage: getDisksErrors,
                    system: getSystemErrors,
                }[source] || fallback;

            newCount.warnings += data.totalWarningCount;
            newCount.errors += data.totalErrorCount;

            return {
                warnings: [...prev.warnings, ...getWarnings(data.warnings)],
                errors: [...prev.errors, ...getErrorsFunction(data.errors)],
            };
        },
        { warnings: [], errors: [] }
    );

    const newAlerts = [...combinedAlerts.errors, ...combinedAlerts.warnings];

    return {
        alerts: newAlerts,
        count: newCount,
    };
};
