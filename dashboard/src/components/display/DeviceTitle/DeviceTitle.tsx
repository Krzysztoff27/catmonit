import { Box, Group, GroupProps, Stack, Text } from "@mantine/core";
import { IconServer2 } from "@tabler/icons-react";

interface DeviceTitleProps extends GroupProps {
    name: string;
    address: string;
    size?: number | string;
    iconSize?: number | string;
}

function DeviceTitle({ name, size = "var(--mantine-font-size-lg)", iconSize = 44, address, ...props }: DeviceTitleProps) {
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
                    {name}
                </Text>
                <Text
                    fz={`calc(${size} * 0.75)`}
                    lh="xs"
                >
                    {address}
                </Text>
            </Stack>
        </Group>
    );
}

export default DeviceTitle;
