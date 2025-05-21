import { Group, ScrollArea, Stack } from "@mantine/core";
import { useState } from "react";
import AlertCount from "../../display/AlertCount/AlertCount";
import AlertListElement from "../../display/AlertListElement/AlertListElement";
import { WidgetContentProps } from "../../../types/components.types";
import { Alert } from "../../../types/api.types";
import { dummies } from "../../../pages/Editor/dummies";
function AlertWidget({ data, settings, ...props }: WidgetContentProps) {
    //source: trust me bro
    const [alerts, setAlerts] = useState<Record<string, Alert>>(dummies.alerts as Record<string, Alert>);
    const [hiddenAlerts, setHiddenAlerts] = useState<Record<string, Alert>>({});

    const handleRemove = (idToRemove: number) => {
        setAlerts((prev) => {
            const updated = { ...prev };
            let removedAlert: Alert | undefined;

            for (const key in updated) {
                if (updated[key].id === idToRemove) {
                    removedAlert = updated[key];
                    delete updated[key];
                    break;
                }
            }

            if (removedAlert) {
                setHiddenAlerts((prevHidden) => ({
                    ...prevHidden,
                    [removedAlert.id]: removedAlert,
                }));
            }

            return updated;
        });
    };
    // Add restore function
    const restoreAlert = (idToRestore: number) => {
        setHiddenAlerts((prevHidden) => {
            const updatedHidden = { ...prevHidden };
            const alertToRestore = updatedHidden[idToRestore];
            if (!alertToRestore) return prevHidden;

            setAlerts((prev) => ({
                ...prev,
                [alertToRestore.id]: alertToRestore,
            }));

            delete updatedHidden[idToRestore];
            return updatedHidden;
        });
    };

    const allAlerts = Object.values(alerts);
    const criticalCount = allAlerts.filter((a) => !a.isWarning).length;
    const mediumCount = allAlerts.filter((a) => a.isWarning).length;

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
                    {allAlerts.map((alert) => (
                        <AlertListElement
                            key={alert.id}
                            alert={alert}
                            onRemove={() => handleRemove(alert.id)}
                        />
                    ))}
                </Stack>
            </ScrollArea>
        </Group>
    );
}

export default AlertWidget;
