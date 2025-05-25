import { Flex, Select, SelectProps, Stack, Text, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { safeObjectValues } from "../../../../utils/object";
import classes from "./DeviceSelect.module.css";
import { useWidgets } from "../../../../contexts/WidgetContext/WidgetContext";
import { Device, DeviceInfo, WidgetData } from "../../../../types/api.types";
import useFetch from "../../../../hooks/useFetch";

interface DeviceSelectProps {
    index: number;
    widget: WidgetData;
    overridenDataSource?: string;
    onChange?: (target: string | null) => void;
}

function DeviceSelect({ index, widget, onChange, overridenDataSource = "" }: DeviceSelectProps) {
    const { data, loading } = useFetch("/device/getAllDevices");
    const { setWidgetSettings, getWidgetConfig } = useWidgets();
    const source = overridenDataSource || getWidgetConfig(widget).dataSource;

    if (!source) {
        console.warn(`[DeviceSelect.tsx]\n
        // Missing data source for the select component.
        // Widgets of type ${widget.type} have no default "dataSource" defined and "overridenDataSource" was not provided.`);
    }

    if (loading) return;

    const selectData = [
        {
            group: "Automatic",
            items: [
                {
                    value: "",
                    label: "Highest usage",
                },
            ],
        },
        {
            group: "Choose device",
            items: safeObjectValues(data).map((deviceInfo) => ({
                value: deviceInfo.uuid,
                label: `${deviceInfo?.hostname} (${deviceInfo?.ipAddress}/${deviceInfo?.mask})`,
            })),
        },
    ];

    const renderOption: SelectProps["renderOption"] = ({ option, checked }) => {
        const deviceInfo: DeviceInfo = data[option.value];
        if (!deviceInfo)
            return (
                <Stack gap="0">
                    {option.label}
                    <Text
                        fz={12}
                        c="dimmed"
                    >
                        cycles through others if multiple widgets set to auto
                    </Text>
                </Stack>
            );
        return (
            <Flex className={classes.selectOption}>
                <Flex className={classes.deviceInfo}>
                    {checked && <IconCheck size={16} />}
                    <Text fz="sm">{deviceInfo?.hostname}</Text>
                </Flex>
                <Flex className={classes.deviceInfo.mask}>
                    <Text fz="sm">
                        {deviceInfo?.ipAddress}/{deviceInfo?.mask}
                    </Text>
                </Flex>
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
            <Stack gap="4">
                <Select
                    unselectable="off"
                    placeholder="Automatic selection"
                    data={selectData}
                    value={widget.settings.target ?? ""}
                    onChange={changeTarget}
                    renderOption={renderOption}
                />
                <Text
                    c="dimmed"
                    fz="xs"
                ></Text>
            </Stack>
        </Stack>
    );
}

export default DeviceSelect;
