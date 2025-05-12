import { Center, Flex, Group, Paper, Text } from "@mantine/core";
import { IconAlertTriangleFilled, IconExclamationCircleFilled, IconX } from "@tabler/icons-react";
import DeviceTitle from "../DeviceTitle/DeviceTitle";

interface AlertListElementProps {
    isWarning: boolean;
    onRemove: () => void;
}

function AlertListElement({ isWarning, onRemove }: AlertListElementProps) {
    return (
        <Paper
            w="800px"
            p="sm"
            bg="var(--background-color-6)"
        >
            <Group>
                <Center h="100%">
                    <DeviceTitle
                        name="Tux"
                        address="10.10.10.10"
                        mr="150px"
                    />
                    {isWarning ? <IconAlertTriangleFilled color="red" /> : <IconExclamationCircleFilled color="red" />}
                    <Text
                        ml="sm"
                        c="red.7"
                    >
                        Storage below 5%. Free up space.
                    </Text>
                </Center>
                <Flex
                    justify="flex-end"
                    flex="1"
                >
                    {/* might want to add  some pop-up when on hover 
                    and change color of the icon */}
                    <IconX
                        stroke="3.5px"
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
