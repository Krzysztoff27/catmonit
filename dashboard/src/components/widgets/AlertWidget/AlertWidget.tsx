import { Group, ScrollArea, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import AlertCount from "../../display/AlertCount/AlertCount";
import AlertListElement from "../../display/AlertListElement/AlertListElement";
import { WidgetContentProps } from "../../../types/components.types";
import { Alert, DisksErrorInfo, SystemErrorInfo, WarningInfo } from "../../../types/api.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { useCookies } from "react-cookie";
import { safeObjectValues } from "../../../utils/object";
import { useData } from "../../../contexts/DataContext/DataContext";

function AlertWidget({ data, settings, ...props }: WidgetContentProps) {
    //source: trust me bro
    const { getData } = useWidgets();
    const [cookies, setCookies] = useCookies(["hiddenAlerts"]);
    const [hiddenIds, setHiddenIds] = useState<string[]>(cookies.hiddenAlerts ?? []);
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const { websockets } = useData();

    useEffect(() => {
        setHiddenIds(cookies.hiddenAlerts ?? []);

        (settings?.sources ?? []).forEach((source) => {
            websockets[source].updateNumberOfWarnings(10 + (cookies.hiddenAlerts?.length ?? 0));
            websockets[source].updateNumberOfErrors(10 + (cookies.hiddenAlerts?.length ?? 0));
        });
    }, [cookies.hiddenAlerts]);

    useEffect(() => {
        const getDisksErrors = (disksErrors: Record<string, DisksErrorInfo>) =>
            safeObjectValues(disksErrors).reduce(
                (prev: Alert[], errorInfo: DisksErrorInfo) => [
                    ...prev,
                    ...errorInfo.disksErrorsPayloads.map(({ mountPoint, message }) => ({
                        message: `[${mountPoint}] ${message}`,
                        deviceInfo: errorInfo.deviceInfo,
                        isWarning: false,
                        id: `${errorInfo.deviceInfo.uuid}:::${message}`,
                    })),
                ],
                []
            );

        const getSystemErrors = (systemErrors: Record<string, SystemErrorInfo>) =>
            safeObjectValues(systemErrors).reduce(
                (prev: Alert[], errorInfo: SystemErrorInfo) => [
                    ...prev,
                    ...errorInfo.systemErrorsPayloads.map(({ message }) => ({
                        message,
                        deviceInfo: errorInfo.deviceInfo,
                        isWarning: false,
                        id: `${errorInfo.deviceInfo.uuid}:::${message}`,
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
                                id: `${warningInfo.deviceInfo.uuid}:::${message}`,
                            } as Alert)
                    ),
                ],
                []
            );

        const combinedAlerts = (settings?.sources ?? []).reduce(
            (prev, source: string) => {
                const data = getData(source);
                console.log(data);

                const fallback = () => [];
                const getErrorsFunction =
                    {
                        storage: getDisksErrors,
                        system: getSystemErrors,
                    }[source] || fallback;

                return {
                    warnings: [...prev.warnings, ...getWarnings(data.warnings)],
                    errors: [...prev.errors, ...getErrorsFunction(data.errors)],
                };
            },
            { warnings: [], errors: [] }
        );

        const newAlerts = [...combinedAlerts.errors, ...combinedAlerts.warnings].filter((alert: Alert) => !hiddenIds.includes?.(alert.id));
        setAlerts(newAlerts);
    }, [data, settings?.sources]);

    const hideAlert = (id: string) => {
        if (!hiddenIds.includes(id)) setCookies("hiddenAlerts", [...hiddenIds, id]);
    };

    const criticalCount = alerts.filter((a) => !a.isWarning).length;
    const mediumCount = alerts.filter((a) => a.isWarning).length;

    return (
        <Group
            gap="sm"
            h="100%"
            wrap="nowrap"
            align="start"
        >
            <AlertCount
                criticalCount={criticalCount}
                mediumCount={mediumCount}
                isWarning={false}
            />
            <ScrollArea
                maw="calc(100% - 256px)"
                w="100%"
                h="100%"
                scrollbarSize="0.625rem"
                type="never"
            >
                <Stack
                    gap="xs"
                    pr="lg"
                >
                    {alerts.map((alert, i) => (
                        <AlertListElement
                            key={i}
                            alert={alert}
                            onRemove={(e) => {
                                e.stopPropagation();
                                hideAlert(alert.id);
                            }}
                        />
                    ))}
                </Stack>
            </ScrollArea>
        </Group>
    );
}

export default AlertWidget;
