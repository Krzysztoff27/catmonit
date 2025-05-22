import { Group, ScrollArea, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import AlertCount from "../../display/AlertCount/AlertCount";
import AlertListElement from "../../display/AlertListElement/AlertListElement";
import { WidgetContentProps } from "../../../types/components.types";
import { Alert, ErrorInfo, WarningInfo } from "../../../types/api.types";
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
        });
    }, [cookies.hiddenAlerts]);

    useEffect(() => {
        const combinedAlerts = (settings?.sources ?? []).reduce(
            (prev, source: string) => {
                const data = getData(source);
                return {
                    warnings: [...prev.warnings, ...safeObjectValues(data.warnings)],
                    errors: [...prev.errors, ...safeObjectValues(data.errors)],
                };
            },
            { warnings: [], errors: [] }
        );

        const getAlertArray = (type: "warnings" | "errors") =>
            combinedAlerts[type].reduce(
                (prev: Alert[], warningInfo: WarningInfo | ErrorInfo) => [
                    ...prev,
                    ...warningInfo[type].map(
                        (message: string) =>
                            ({
                                message,
                                deviceInfo: warningInfo.deviceInfo,
                                isWarning: type === "warnings",
                                id: `${warningInfo.deviceInfo.uuid}:::${message}`,
                            } as Alert)
                    ),
                ],
                []
            );

        const newAlerts = [...getAlertArray("errors"), ...getAlertArray("warnings")].filter((alert: Alert) => !hiddenIds.includes?.(alert.id));
        setAlerts(newAlerts);
    }, [data, settings?.sources]);

    function prepareData() {
        //const used = disksArray?.reduce((prev, d) => prev + d.usage, 0) ?? 0;
    }

    const handleVisibilty = (id: string) => {
        console.log("visibility changed");
        const index = hiddenIds.findIndex((e) => e === id);
        if (index !== -1) {
            setCookies("hiddenAlerts", hiddenIds.toSpliced(index, 1));
        } else {
            setCookies("hiddenAlerts", [...hiddenIds, id]);
        }
        // setAlerts((prev) => {
        //     const updated = { ...prev };
        //     let removedAlert: Alert | undefined;

        //     for (const key in updated) {
        //         if (updated[key].id === idToRemove) {
        //             removedAlert = updated[key];
        //             delete updated[key];
        //             break;
        //         }
        //     }

        //     if (removedAlert) {
        //         setHiddenAlerts((prevHidden) => ({
        //             ...prevHidden,
        //             [removedAlert.id]: removedAlert,
        //         }));
        //     }

        //     return updated;
        // });
    };
    // Add restore function
    // const restoreAlert = (idToRestore: number) => {
    //     setHiddenAlerts((prevHidden) => {
    //         const updatedHidden = { ...prevHidden };
    //         const alertToRestore = updatedHidden[idToRestore];
    //         if (!alertToRestore) return prevHidden;

    //         setAlerts((prev) => ({
    //             ...prev,
    //             [alertToRestore.id]: alertToRestore,
    //         }));

    //         delete updatedHidden[idToRestore];
    //         return updatedHidden;
    //     });
    // };

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
                type="auto"
            >
                <Stack
                    gap="xs"
                    pr="lg"
                >
                    {alerts.map((alert) => (
                        <AlertListElement
                            key={alert.id}
                            alert={alert}
                            onRemove={(e) => {
                                e.stopPropagation();
                                handleVisibilty(alert.id);
                            }}
                        />
                    ))}
                </Stack>
            </ScrollArea>
        </Group>
    );
}

export default AlertWidget;
