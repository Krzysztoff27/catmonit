import { Flex, Select, SelectProps, Stack, Text, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { safeObjectValues } from "../../../../utils/object";
import classes from "./TargetSelect.module.css";
import { useWidgets } from "../../../../contexts/WidgetContext/WidgetContext";
import { WidgetData } from "../../../../types/api.types";

interface TargetSelectProps {
    index: number;
    widget: WidgetData;
    overridenDataSource?: string;
    onChange?: (target: string | null) => void;
}

function TargetSelect({ index, widget, onChange, overridenDataSource = "" }: TargetSelectProps) {
    const { setWidgetSettings, getData, getWidgetConfig } = useWidgets();
    const source = overridenDataSource || getWidgetConfig(widget).dataSource;

    if (!source) {
        console.warn(
            `[TargetSelect.tsx]\n
            Missing data source for the select component.
            Widgets of type ${widget.type} have no default "dataSource" defined and "overridenDataSource" was not provided.`
        );
    }

    const data = source ? getData(source) : {};
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
        setWidgetSettings(index, { ...widget.settings, target, automatic: !target });
        onChange?.(target);
    };

    return (
        <Stack className={classes.container}>
            <Title order={4}>Target</Title>
            <Select
                unselectable="off"
                placeholder="Auto"
                value={widget.settings.target || ""}
                data={selectData}
                onChange={changeTarget}
                renderOption={renderOption}
            />
        </Stack>
    );
}

export default TargetSelect;
