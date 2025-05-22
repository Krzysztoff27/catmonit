import { Group, Progress, Stack, Text } from "@mantine/core";
import { formatBytes } from "../../../utils/formatBytes";
import { useElementSize } from "@mantine/hooks";
import ScrollingText from "../ScrollingText/ScrollingText";

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
    const { ref, width } = useElementSize();
    const value = (usage / capacity) * 100;
    const color = value >= highlightStages.red ? "red" : value >= highlightStages.yellow ? "yellow" : "var(--mantine-color-text)";

    return (
        <Stack gap={0}>
            <ScrollingText
                w={`${width}px`}
                m="none"
                mb="-8px"
                lh="16px"
            >
                <Text
                    fz="xs"
                    fw="500"
                >
                    {path}
                </Text>
            </ScrollingText>
            <Group>
                <Progress
                    value={value}
                    color={color}
                    flex="1"
                    size="sm"
                    ref={ref}
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
