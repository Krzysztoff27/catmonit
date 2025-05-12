import { Group, Paper, Stack } from "@mantine/core";
import { useState } from "react";
import AlertCount from "../../display/AlertCount/AlertCount";
import AlertListElement from "../../display/AlertListElement/AlertListElement";

type Alert = {
    id: number;
    isWarning: boolean;
};

const initialAlerts: Alert[] = [
    { id: 1, isWarning: true },
    { id: 2, isWarning: false },
    { id: 3, isWarning: false },
];

function AlertWidget() {
    const [alerts, setAlerts] = useState(initialAlerts);

    const handleRemove = (idToRemove: number) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== idToRemove));
    };

    return (
        <Paper
            m="10px"
            p="md"
            w="1100px"
            bg="var(--background-color-8)"
        >
            <Group gap="md">
                <AlertCount
                    criticalCount={3}
                    mediumCount={10}
                    isWarning={false}
                />
                <Stack gap="10px">
                    {alerts.map((alert) => (
                        <AlertListElement
                            key={alert.id}
                            isWarning={alert.isWarning}
                            onRemove={() => handleRemove(alert.id)}
                        />
                    ))}
                </Stack>
            </Group>
        </Paper>
    );
}

export default AlertWidget;
