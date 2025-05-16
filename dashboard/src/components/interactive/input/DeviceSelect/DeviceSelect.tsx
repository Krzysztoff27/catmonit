import { Flex, Select, SelectProps, Stack, Text, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useWidgets } from "../../../../contexts/WidgetContext/WidgetContext";
import { safeObjectValues } from "../../../../utils/object";

export default function DeviceSelect({ value = "", onChange }) {
    const { getData } = useWidgets();

    const data = getData("storage");

    const selectData = [
        { value: "", label: "Automatic selection" },
        ...safeObjectValues(data).map((device) => ({
            value: device.uuid,
            label: `${device.hostname} (${device.ip}${device.mask})`,
        })),
    ];

    const renderOption: SelectProps["renderOption"] = ({ option, checked }) => {
        const device = data[option.value];

        if (!device) return <i>{option.label}</i>;

        return (
            <Flex
                align="center"
                justify="space-between"
                w="100%"
            >
                <Flex
                    gap="xs"
                    align="center"
                >
                    {checked && <IconCheck size={16} />}
                    <Text fz="sm">{device?.hostname}</Text>
                </Flex>
                <Text
                    fz="sm"
                    c="var(--background-color-3)"
                    style={{ fontFamily: "monospace" }}
                >
                    {device?.ip} {device?.mask}
                </Text>
            </Flex>
        );
    };

    return (
        <Stack gap="4">
            <Title order={4}>Target</Title>
            <Select
                unselectable="off"
                placeholder="Auto"
                data={selectData}
                value={value}
                onChange={onChange}
                renderOption={renderOption}
            />
        </Stack>
    );
}
