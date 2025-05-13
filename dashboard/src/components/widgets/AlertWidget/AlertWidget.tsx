import { Group, Paper, ScrollArea, Stack } from "@mantine/core";
import { useState } from "react";
import AlertCount from "../../display/AlertCount/AlertCount";
import classes from "./AlertWidget.module.css";
import AlertListElement from "../../display/AlertListElement/AlertListElement";

type Alert = {
    id: number;
    isWarning: boolean;
};

const initialAlerts: Alert[] = [
    { id: 1, isWarning: true },
    { id: 2, isWarning: false },
    { id: 3, isWarning: false },
    { id: 4, isWarning: false },
    { id: 5, isWarning: false },
    { id: 6, isWarning: false },
    { id: 7, isWarning: false },
    { id: 8, isWarning: false },
    { id: 9, isWarning: false },
    { id: 10, isWarning: false },
];

function AlertWidget({ data, settings, className, ...props }) {
    const [alerts, setAlerts] = useState(initialAlerts);

    const handleRemove = (idToRemove: number) => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== idToRemove));
    };

    return (
        <Paper
            {...props}
            className={`${className} ${classes.container}`}
        >
            <Group
                gap="sm"
                h="100%"
                wrap="nowrap"
                align="start"
            >
                <AlertCount
                    criticalCount={3}
                    mediumCount={10}
                    isWarning={false}
                />
                <ScrollArea
                    maw="calc(100% - 256px)"
                    w="100%"
                    h="100%"
                    scrollbarSize="0.625rem"
                >
                    <Stack
                        gap="xs"
                        pr="lg"
                    >
                        {alerts.map((alert) => (
                            <AlertListElement
                                key={alert.id}
                                isWarning={alert.isWarning}
                                onRemove={() => handleRemove(alert.id)}
                            />
                        ))}
                    </Stack>
                </ScrollArea>
            </Group>
        </Paper>
    );
}

export default AlertWidget;
