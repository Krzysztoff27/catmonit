import { Group, GroupProps, RingProgress, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import API_CONFIG from "../../../config/api.config";
import { IconX } from "@tabler/icons-react";

interface TimeoutRingProgressProps extends GroupProps {
    timestamp: string;
    source: string;
}

const TimeoutRingProgress = ({ timestamp, source, ...props }: TimeoutRingProgressProps): React.JSX.Element => {
    const [value, setValue] = useState(0);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const ts = new Date(timestamp).getTime();
        const timeout = API_CONFIG.deviceTimeout[source];

        const update = () => {
            const now = Date.now();
            const diff = now - ts;
            const percent = Math.min(100, Math.max(0, (diff / timeout) * 100));
            setValue(percent);
            animationRef.current = requestAnimationFrame(update);
        };

        animationRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationRef.current!);
    }, [timestamp]);

    const localString = new Date(timestamp).toLocaleString();
    // const [date, time, _] = timestamp?.split?.(/[TZ\.]+/) || ["", ""];

    const message = timestamp ? `Updated ${localString}` : "Couldn't reach";

    return (
        <Group
            gap="0"
            align="center"
            {...props}
        >
            {timestamp ? (
                <RingProgress
                    size={18}
                    thickness={4}
                    sections={[{ value: value, color: "dimmed" }]}
                    style={{
                        transform: "scale(80%)",
                    }}
                />
            ) : (
                <IconX
                    size={18}
                    stroke={2.5}
                    color="var(--mantine-color-dimmed)"
                    style={{ transform: "scale(80%)" }}
                />
            )}
            <Text
                size="12px"
                c="dimmed"
                fw="800"
                ff="monospace"
            >
                {message}
            </Text>
        </Group>
    );
};

export default TimeoutRingProgress;
