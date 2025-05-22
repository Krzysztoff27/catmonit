import { Group, GroupProps, Text } from "@mantine/core";
import { IconServer2 } from "@tabler/icons-react";
import { Device } from "../../../types/api.types";
import ScrollingText from "../ScrollingText/ScrollingText";

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
            <ScrollingText
                flex="1"
                style={{ overflow: "hidden" }}
            >
                <Text
                    fz="lg"
                    lh="xs"
                    fw="600"
                >
                    {data?.deviceInfo?.hostname ?? "Not set"}
                </Text>
            </ScrollingText>
            <Text
                fz="sm"
                ml="auto"
                w="fit-content"
                ta="right"
            >
                {data?.deviceInfo?.ipAddress ? data?.deviceInfo?.ipAddress : ""}/{data?.deviceInfo?.mask ? data?.deviceInfo?.mask : ""}
            </Text>
        </Group>
    );
}

export default DeviceTitleOneLine;
