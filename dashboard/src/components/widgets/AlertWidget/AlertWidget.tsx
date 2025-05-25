import { Group, ScrollArea, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import AlertCount from "../../display/AlertCount/AlertCount";
import AlertListElement from "../../display/AlertListElement/AlertListElement";
import { WidgetContentProps } from "../../../types/components.types";
import { Alert } from "../../../types/api.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { useCookies } from "react-cookie";
import { useData } from "../../../contexts/DataContext/DataContext";
import { getAllAlertData } from "./alertWidgetUtils";

interface Counts {
    errors: number;
    warnings: number;
}

function AlertWidget({ data, settings, ...props }: WidgetContentProps) {
    //source: trust me bro
    const { getData } = useWidgets();
    const [cookies, setCookies] = useCookies(["hiddenAlerts"]);
    const [hiddenIds, setHiddenIds] = useState<string[]>(cookies.hiddenAlerts ?? []);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [count, setCount] = useState<Counts>({ errors: 0, warnings: 0 });

    const { websockets } = useData();

    useEffect(() => {
        setHiddenIds(cookies.hiddenAlerts ?? []);
        (settings?.sources ?? []).forEach((source) => {
            websockets[source].updateNumberOfWarnings(10 + (cookies.hiddenAlerts?.length ?? 0));
            websockets[source].updateNumberOfErrors(10 + (cookies.hiddenAlerts?.length ?? 0));
        });
    }, [cookies.hiddenAlerts]);

    useEffect(() => {
        const preparedData = getAllAlertData(settings, hiddenIds, getData);
        setAlerts(preparedData.alerts.filter((alert: Alert) => !hiddenIds.includes?.(alert.id)));
        setCount(preparedData.count);
    }, [data, settings?.sources]);

    const hideAlert = (id: string) => {
        if (!hiddenIds.includes(id)) setCookies("hiddenAlerts", [...hiddenIds, id]);
    };

    return (
        <Group
            gap="sm"
            h="100%"
            wrap="nowrap"
            align="start"
        >
            <AlertCount
                criticalCount={count.errors}
                mediumCount={count.warnings}
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
