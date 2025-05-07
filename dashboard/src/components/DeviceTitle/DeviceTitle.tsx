import { Group, GroupProps, Stack, Text } from "@mantine/core";
import { IconServer2 } from "@tabler/icons-react";

interface DeviceTitleProps extends GroupProps {
    name: string;
    address: string;
}

function DeviceTitle({ name, address, ...props }: DeviceTitleProps) {
    return (
        <Group
            gap="xs"
            {...props}
        >
            <IconServer2
                size={44}
                stroke={1.5}
            />
            <Stack gap="0">
                <Text
                    fz="lg"
                    lh="xs"
                    fw="600"
                >
                    {name}
                </Text>
                <Text
                    fz="sm"
                    lh="xs"
                >
                    {address}
                </Text>
            </Stack>
        </Group>
    );
}

export default DeviceTitle;
