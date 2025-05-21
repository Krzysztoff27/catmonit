import { Flex, Select, SelectProps, Stack, Text, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { safeObjectValues } from "../../../../utils/object";
import classes from "./DeviceSelect.module.css";
import { useWidgets } from "../../../../contexts/WidgetContext/WidgetContext";
import { WidgetData } from "../../../../types/api.types";
import useFetch from "../../../../hooks/useFetch";

interface DeviceSelectProps {
    index: number;
    widget: WidgetData;
    overridenDataSource?: string;
    onChange?: (target: string | null) => void;
}

function DeviceSelect({ index, widget, onChange, overridenDataSource = "" }: DeviceSelectProps) {
    const {data, loading} = useFetch('/device/getAllDevices');
    const { setWidgetSettings, getWidgetConfig } = useWidgets();
    const source = overridenDataSource || getWidgetConfig(widget).dataSource;

    if (!source) {
        console.warn(`[DeviceSelect.tsx]\n
        // Missing data source for the select component.
        // Widgets of type ${widget.type} have no default "dataSource" defined and "overridenDataSource" was not provided.`);
    }


    const selectData = [
        {
            value: "",
            label: "Automatic selection",
        },
        ...safeObjectValues(data).map((device) => ({
            value: device.uuid,
            label: `${device.hostname} (${device.ip}${device.mask})`,
        })),
    ];

    const renderOption: SelectProps["renderOption"] = ({ option, checked }) => {
        const device = data[option.value];
        if (!device) return <i>{option.label}</i>;
        return (
            <Flex className={classes.selectOption}>
                <Flex className={classes.deviceInfo}>
                    {checked && <IconCheck size={16} />}
                    <Text fz="sm">{device?.hostname}</Text>
                </Flex>
                <Text className={classes.ipMask}>
                    {device?.ip} {device?.mask}
                </Text>
            </Flex>
        );
    };

    const changeTarget = (target: string | null) => {
        setWidgetSettings(index, { ...widget.settings, target: target || null });
        onChange?.(target || null);
    };

    return (
        <Stack className={classes.container}>
            <Title order={4}>Target</Title>
            <Select
                unselectable="off"
                placeholder="Auto"
                data={selectData}
                value={widget.settings.target}
                onChange={changeTarget}
                renderOption={renderOption}
            />
        </Stack>
    );
}

export default DeviceSelect;
