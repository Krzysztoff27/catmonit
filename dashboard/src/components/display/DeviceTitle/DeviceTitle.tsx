import { Box, Group, GroupProps, Stack, Text } from "@mantine/core";
import { IconServer2 } from "@tabler/icons-react";
import { Device } from "../../../types/api.types";

interface DeviceTitleProps extends GroupProps {
    data: Device;
    size?: number | string;
    iconSize?: number | string;
}

function DeviceTitle({ data, size = "var(--mantine-font-size-lg)", iconSize = 44, ...props }: DeviceTitleProps) {
    return (
        <Group
            gap="8"
            wrap="nowrap"
            maw="160px"
            {...props}
        >
            <Box
                w={iconSize}
                h={iconSize}
            >
                <IconServer2
                    size={iconSize}
                    stroke={1.5}
                />
            </Box>
            <Stack gap="0">
                <Text
                    fz={size}
                    lh="xs"
                    fw="600"
                >
                    {data?.deviceInfo?.hostname ?? "Not set"}
                </Text>
                <Text
                    fz={`calc(${size} * 0.75)`}
                    lh="xs"
                >
                    {data?.deviceInfo?.ipAddress ? data?.deviceInfo?.ipAddress : ""}/{data?.deviceInfo?.mask ? data?.deviceInfo?.mask : ""}
                </Text>
            </Stack>
        </Group>
    );
}

export default DeviceTitle;
