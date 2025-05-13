import { Group, Paper, Stack, Text } from "@mantine/core";
import { IconAlertTriangleFilled, IconExclamationCircleFilled } from "@tabler/icons-react";

interface AlertCountProps {
    criticalCount: number;
    mediumCount: number;
    isWarning: boolean; //rename later
}

function AlertCount({ criticalCount, mediumCount, isWarning }: AlertCountProps) {
    return (
        <Paper
            radius="md"
            h="224"
            w="224"
            bg="var(--background-color-6)"
            p="16"
        >
            <Stack gap={0}>
                <Group gap="xs">
                    {isWarning ? (
                        <>
                            <Text
                                fz="35"
                                fw="500"
                                lh={0}
                            >
                                Warnings
                            </Text>
                            <IconAlertTriangleFilled />
                        </>
                    ) : (
                        <>
                            <Text
                                fz="35"
                                fw="500"
                                lh={0}
                            >
                                Errors
                            </Text>
                            <IconExclamationCircleFilled />
                        </>
                    )}
                </Group>
                <Text
                    fz="100"
                    fw="500"
                    lh="150px"
                >
                    {criticalCount + mediumCount}
                </Text>
                <Group gap={5}>
                    {/* add padding-bottom instead of lh in count */}
                    <Text
                        c="red.7"
                        fw="500"
                        fz="18"
                    >
                        {criticalCount} critical,
                    </Text>
                    <Text
                        c="orange"
                        fz="18"
                    >
                        {mediumCount} medium
                    </Text>
                </Group>
            </Stack>
        </Paper>
    );
}

export default AlertCount;
