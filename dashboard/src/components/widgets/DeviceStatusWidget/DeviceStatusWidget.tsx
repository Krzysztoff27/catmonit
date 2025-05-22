import { Box, Stack, Title, Text, Flex, Group } from "@mantine/core";
import { WidgetContentProps } from "../../../types/components.types";
import { useElementSize } from "@mantine/hooks";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import MetricProgress from "../../display/MetricProgress/MetricProgress";
import { Device } from "../../../types/api.types";
import { timePassedRounded } from "../../../utils/timeFormats";
import { useState, useEffect } from "react";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { IconCpu } from "@tabler/icons-react";

function DeviceStatusWidget({ index, data, settings, ...props }: WidgetContentProps) {
    const { ref } = useElementSize();
    const device = data as Device;
    const { getWidget } = useWidgets();

    if (!device || !device.systemInfo) return null;

    const systemInfo = device.systemInfo;

    const getBootDate = (): Date | null => {
        const ts = systemInfo.lastBootTimestamp;
        if (typeof ts === "number") {
            const ms = ts > 1e12 ? ts : ts * 1000;
            const date = new Date(ms);
            return isNaN(date.getTime()) ? null : date;
        }
        const date = new Date(ts);
        return isNaN(date.getTime()) ? null : date;
    };

    const [uptimeNow, setUptimeNow] = useState(Date.now());

    useEffect(() => {
        const bootDate = getBootDate();
        if (!bootDate) return;

        const [, unit] = timePassedRounded(bootDate);
        let interval = 60 * 60 * 1000; // default 1 hour

        if (unit === "seconds") interval = 1000;
        else if (unit === "minutes") interval = 60 * 1000;
        else if (unit === "hours") interval = 60 * 60 * 1000;
        else if (unit === "days") interval = 24 * 60 * 60 * 1000;

        const timer = setTimeout(() => {
            setUptimeNow(Date.now());
        }, interval);

        return () => clearTimeout(timer);
    }, [systemInfo.lastBootTimestamp, uptimeNow]);

    const bootDate = getBootDate();

    let uptimeDisplay = "N/A";
    if (bootDate) {
        const [uptimeValue, uptimeUnit] = timePassedRounded(bootDate);
        if (uptimeValue != null && uptimeUnit) {
            uptimeDisplay = `${uptimeValue} ${uptimeUnit}`;
        }
    }
    return (
        <Box {...props}>
            <Stack>
                <DeviceTitleOneLine
                    data={device}
                    mb="6"
                />

                <Stack
                    gap="sm"
                    ref={ref}
                >
                    <MetricProgress
                        label="CPU Usage"
                        used={systemInfo.cpuUsagePercent ?? 0}
                        total={100}
                        isPercentage
                    />

                    <MetricProgress
                        label="RAM usage"
                        used={systemInfo.ramUsedBytes ?? 0}
                        total={systemInfo.ramTotalBytes ?? 0}
                    />
                    <MetricProgress
                        label="Swap usage"
                        used={systemInfo.pagefileUsedBytes ?? 0}
                        total={systemInfo.pagefileTotalBytes ?? 0}
                    />

                    {getWidget(index).rect.h > 2 && (
                        <>
                            <Stack gap={0}>
                                <Text
                                    fz="xs"
                                    fw={500}
                                >
                                    CPU load averages
                                </Text>
                                <Flex
                                    gap="sm"
                                    wrap="wrap"
                                    fz="md"
                                >
                                    {["1m", "5m", "15m"].map((label) => (
                                        <Text key={label}>
                                            N/A{" "}
                                            <Text
                                                component="span"
                                                fz="xs"
                                                span
                                                c="var(--background-color-2)"
                                            >
                                                {label}
                                            </Text>
                                        </Text>
                                    ))}
                                </Flex>
                            </Stack>

                            <Group gap={5}>
                                <Text
                                    fz="sm"
                                    fw={500}
                                >
                                    Uptime:
                                </Text>
                                <Text fz="sm">{bootDate ? `${timePassedRounded(bootDate)[0]} ${timePassedRounded(bootDate)[1]}` : "N/A"}</Text>
                            </Group>

                            <Group gap={5}>
                                <IconCpu />
                                <Text
                                    fz="sm"
                                    fw="500"
                                >
                                    Cores: N/A
                                </Text>
                            </Group>
                        </>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
}

export default DeviceStatusWidget;
