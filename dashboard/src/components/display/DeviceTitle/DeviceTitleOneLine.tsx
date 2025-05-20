import { Group, GroupProps, Text } from "@mantine/core";
import { IconServer2 } from "@tabler/icons-react";
import { Device } from "../../../types/api.types";
interface DeviceTitleProps extends GroupProps {
    data: Device;
}

function DeviceTitleOneLine({ data, ...props }: DeviceTitleProps) {
    return (
        <Group
            gap="8"
            {...props} // bg="red"
            pr="sm"
        >
            <IconServer2
                size={24}
                stroke={2.2}
            />
            <Text
                fz="lg"
                lh="xs"
                fw="600"
            >
                {data?.hostname ?? "Not set"}
            </Text>
            <Text
                fz="sm"
                ml="auto"
            >
                {data?.ip && data?.mask ? `${data.ip}/${data.mask}` : ""}
            </Text>
        </Group>
    );
}

export default DeviceTitleOneLine;
