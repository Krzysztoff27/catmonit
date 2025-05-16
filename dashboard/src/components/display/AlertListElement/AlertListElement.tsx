import { Box, Center, Flex, Group, Paper, Text } from "@mantine/core";
import { IconAlertCircle, IconAlertTriangleFilled, IconExclamationCircleFilled, IconEyeOff, IconX } from "@tabler/icons-react";
import DeviceTitle from "../DeviceTitle/DeviceTitle";
import classes from "./AlertListElement.module.css";
import ScrollingText from "../ScrollingText/ScrollingText";

interface AlertListElementProps {
    isWarning: boolean;
    onRemove: () => void;
}

function AlertListElement({ isWarning, onRemove }: AlertListElementProps) {
    return (
        <Paper
            maw="100%"
            bg="var(--background-color-6)"
            h="51"
            miw="0"
            style={{ overflow: "hidden" }}
        >
            <Group
                w="100%"
                h="100%"
                align="center"
                px="xs"
            >
                <DeviceTitle
                    data={{
                        hostname: "Tuxaababababababa",
                        ip: "10.10.10.10",
                        mask: "24",
                        uuid: "abc",
                    }}
                    iconSize={36}
                    size="var(--mantine-font-size-md)"
                    style={{ overflow: "hidden" }}
                />
                <Box style={{ flex: "1 0 0", minWidth: 0 }}>
                    <ScrollingText
                        maw="100%"
                        scroll={true}
                    >
                        <IconAlertCircle
                            size="16"
                            style={{ transform: "translateY(2.5px)", marginRight: "4" }}
                        />
                        Storage below 5%. Free up space. Test Test Test Testa
                    </ScrollingText>
                </Box>

                <Flex
                    justify="center"
                    w="fit-content"
                    pr="xs"
                    ml="auto"
                >
                    {/* might want to add  some pop-up when on hover
                    and change color of the icon */}
                    <IconEyeOff
                        stroke="2.5"
                        size={18}
                        color="var(--background-color-3)"
                        onClick={onRemove}
                        style={{ cursor: "pointer" }}
                    />
                </Flex>
            </Group>
        </Paper>
    );
}

export default AlertListElement;
