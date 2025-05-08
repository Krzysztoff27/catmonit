import { Group, GroupProps, Stack, Text } from "@mantine/core";
import { IconServer2 } from "@tabler/icons-react";

interface DeviceTitleProps extends GroupProps {
    name: string;
    address: string;
}

function DeviceTitleSmall({ name, address, ...props }: DeviceTitleProps) {
    return (
        <Group
            gap="8"
            {...props}
            // bg="red"
            pr="sm"
        >
            <IconServer2
                size={24}
                stroke={2.2}
            />
            <Text
                fz="lg"
                lh="xs"
                fw="700"
            >
                {name}
            </Text>
            <Text
                fz="sm"
                ml="auto"
            >
                {address}
            </Text>
        </Group>
    );
}

export default DeviceTitleSmall;
