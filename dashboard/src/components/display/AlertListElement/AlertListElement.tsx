import { ActionIcon, Box, Flex, Group, Paper } from "@mantine/core";
import { IconAlertCircle, IconEyeOff } from "@tabler/icons-react";
import DeviceTitle from "../DeviceTitle/DeviceTitle";
import ScrollingText from "../ScrollingText/ScrollingText";
import classes from "./AlertListElement.module.css";
import { Alert, Device } from "../../../types/api.types";

export interface AlertListElementProps {
    alert: Alert;
    onRemove: (e) => void;
}

function AlertListElement({ alert, onRemove }: AlertListElementProps) {
    return (
        <Paper
            maw="100%"
            bg="var(--background-color-6)"
            h={51}
            miw={0}
            style={{ overflow: "hidden" }}
        >
            <Group
                w="100%"
                h="100%"
                align="center"
                px="xs"
            >
                <DeviceTitle
                    data={
                        {
                            deviceInfo: {
                                hostname: alert.deviceInfo.hostname,
                                ipAddress: alert.deviceInfo.ipAddress,
                                mask: alert.deviceInfo.mask,
                                uuid: alert.deviceInfo.uuid,
                            },
                        } as Device
                    }
                    iconSize={36}
                    size="var(--mantine-font-size-md)"
                    style={{ overflow: "hidden" }}
                />
                <Box style={{ flex: "1 0 0", minWidth: 0 }}>
                    <ScrollingText
                        maw="100%"
                        scroll
                        c={alert.isWarning ? "orange" : "red"}
                    >
                        <IconAlertCircle
                            size={16}
                            style={{ transform: "translateY(2.5px)", marginRight: 4 }}
                        />
                        {alert.message}
                    </ScrollingText>
                </Box>
                <Flex
                    justify="center"
                    w="fit-content"
                    pr="xs"
                    ml="auto"
                >
                    <ActionIcon onClick={onRemove} bg="none" style={{ cursor: "pointer", zIndex: 301, pointerEvents: 'auto' }}>
                        <IconEyeOff
                            stroke={2.5}
                            size={18}
                            color="var(--background-color-3)"
                            
                        />
                    </ActionIcon>
                </Flex>
            </Group>
        </Paper>
    );
}

export default AlertListElement;
