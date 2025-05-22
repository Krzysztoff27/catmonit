import { Group, Progress, Stack, Text } from "@mantine/core";
import { DiskInfo, Device } from "../../../types/api.types";
import { formatBytes } from "../../../utils/formatBytes";

interface DiskProgressProps {
    path: String;
    usage: number;
    capacity: number;
    highlightStages: {
        yellow: number;
        red: number;
    };
}

function DiskProgress({ path, usage, capacity, highlightStages }: DiskProgressProps) {
    const value = (usage / capacity) * 100;
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
                    {formatBytes(usage)} / {formatBytes(capacity)}
                </Text>
            </Group>
        </Stack>
    );
}

export default DiskProgress;
