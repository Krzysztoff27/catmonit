import { Group, Progress, Stack, Text } from "@mantine/core";
import { Disk } from "../../../types/api.types";

interface DiskProgressProps extends Disk {
    highlightStages: {
        yellow: number;
        red: number;
    };
}

function DiskProgress({ path, storageCurrent, storageLimit, highlightStages }: DiskProgressProps) {
    const value = (storageCurrent / storageLimit) * 100;
    const color = value >= highlightStages.red ? "red" : value >= highlightStages.yellow ? "yellow" : "var(--mantine-color-text)";

    return (
        <Stack gap={0}>
            <Text
                fz="xs"
                fw="500"
                mb="-8px"
            >
                {path}
            </Text>
            <Group>
                <Progress
                    value={value}
                    color={color}
                    flex="1"
                    size="sm"
                />
                <Text
                    fz="sm"
                    miw="120"
                >
                    {storageCurrent}GB / {storageLimit}GB
                </Text>
            </Group>
        </Stack>
    );
}

export default DiskProgress;
