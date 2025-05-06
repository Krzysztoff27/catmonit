import { ActionIcon, Group, GroupProps, Stack, Text, Title } from "@mantine/core";
import { IconChevronDown, IconServer2 } from "@tabler/icons-react";

interface DeviceTitleProps extends GroupProps {
    selectable?: boolean;
    name: string;
    address: string;
}

function DeviceTitle({ name, address, selectable = false, ...props }: DeviceTitleProps) {
    return (
        <Group
            gap="4"
            {...props}
        >
            <IconServer2
                size={44}
                stroke={1.25}
            />
            <Stack gap={0}>
                <Group gap="0">
                    <Text
                        fz="lg"
                        fw="600"
                    >
                        {name}
                    </Text>
                    <ActionIcon
                        variant="transparent"
                        color="light"
                    >
                        <IconChevronDown size={22} />
                    </ActionIcon>
                </Group>
                <Text fz="sm">{address}</Text>
            </Stack>
        </Group>
    );
}

export default DeviceTitle;
