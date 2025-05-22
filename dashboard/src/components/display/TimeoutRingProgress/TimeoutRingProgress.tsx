import { Group, GroupProps, RingProgress, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import API_CONFIG from "../../../config/api.config";

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

    const [date, time, _] = timestamp?.split?.(/[TZ\.]+/) || ["01.01.1970", "00:00"];

    return (
        <Group
            gap="0"
            align="center"
            {...props}
        >
            <RingProgress
                size={18}
                thickness={4}
                sections={[{ value: value, color: "dimmed" }]}
                style={{
                    transform: "scale(80%)",
                }}
            />
            <Text
                size="12px"
                c="dimmed"
                fw="800"
                ff="monospace"
            >
                Last update {`${date} ${time}`}
            </Text>
        </Group>
    );
};

export default TimeoutRingProgress;
