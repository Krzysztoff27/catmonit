import { Button, Flex, Group, NumberInput, ScrollArea, Stack, TextInput, Title } from "@mantine/core";
import { IconEye, IconEyeOff, IconGripVertical } from "@tabler/icons-react";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import AutoOrderToggle from "../../interactive/button/AutoOrderToggle/AutoOrderToggle";
import { safeObjectValues } from "../../../utils/object";
import { WidgetPropertiesContentProps } from "../../../types/components.types";
import DeviceSelect from "../../interactive/input/DeviceSelect/DeviceSelect";
import classes from "./StorageResourcesDrawer.module.css";
import { useMemo } from "react";

const StorageResourcesDrawer = ({ index }: WidgetPropertiesContentProps): React.JSX.Element => {
    const { setWidgetSettings, getWidgetData, getWidgetConfig, getData, getWidget } = useWidgets();
    const widget = getWidget(index);
    const data = getWidgetData(widget);
    const config = getWidgetConfig(widget);
    const dataSource: string = config.dataSource ?? "";
    const resourceKey =
        {
            storage: "disks",
            fileShares: "fileShares",
        }[dataSource] ?? "";
    const selectedDevice = widget?.settings?.target;

    const onDeviceChange = (target: string | null) => {
        if (!target) return;
        const newData = getData(dataSource)[target];
        const newResourceData = safeObjectValues(newData[resourceKey]);
        const newResourceSettings = newResourceData.map(({ path }) => ({ path, hidden: false, yellowStage: 75, redStage: 90 }));
        setWidgetSettings(index, { ...widget.settings, target, [resourceKey]: newResourceSettings });
    };

    const isResourceHidden = (path: string) => {
        return widget?.settings?.[resourceKey]?.find((resource) => resource.path === path).hidden;
    };

    const toggleResourceHidden = (path: string) => {
        const newSettings = widget.settings;
        const diskIndex = newSettings[resourceKey].findIndex((resource) => resource.path === path);
        newSettings[resourceKey][diskIndex].hidden = !newSettings[resourceKey][diskIndex].hidden;
        setWidgetSettings(index, newSettings);
    };

    const toggleAutomatic = () => {
        const newSettings = widget.settings;
        newSettings.automatic = !newSettings.automatic;
        setWidgetSettings(index, newSettings);
    };

    const modifyHighlightStage = (stage: "yellow" | "red", value: number | string) => {
        const newSettings = widget.settings;
        newSettings.highlightStages[stage] = value;
        setWidgetSettings(index, newSettings);
    };

    const resourceList = useMemo(
        () =>
            safeObjectValues(data[resourceKey]).map((resource, i: number) => {
                const hidden = isResourceHidden(resource.path);
                return (
                    <Flex
                        key={i}
                        className={classes.resourceRow}
                    >
                        <IconGripVertical className={classes.iconGrip} />

                        <TextInput
                            value={resource.path}
                            readOnly
                        />
                        <NumberInput
                            defaultValue={widget.settings.highlightStages.yellow}
                            onChange={(val: number | string) => modifyHighlightStage("yellow", val)}
                            min={0}
                            max={100}
                            step={1}
                            suffix="%"
                            className={classes.percentInput}
                        />
                        <NumberInput
                            defaultValue={widget.settings.highlightStages.red}
                            onChange={(val: number | string) => modifyHighlightStage("red", val)}
                            min={0}
                            max={100}
                            step={1}
                            suffix="%"
                            className={classes.percentInput}
                        />

                        <Button
                            variant="outline"
                            onClick={() => toggleResourceHidden(resource.path)}
                            color={hidden ? "var(--background-color-3)" : "var(--background-color-0)"}
                            className={classes.toggleButton}
                        >
                            {hidden ? <IconEyeOff size={24} /> : <IconEye size={24} />}
                        </Button>
                    </Flex>
                );
            }),
        [widget?.settings?.target]
    );

    return (
        <Stack className={classes.container}>
            <DeviceSelect
                index={index}
                widget={widget}
                onChange={onDeviceChange}
            />
            {selectedDevice && data && (
                <>
                    <Title
                        order={5}
                        className={classes.title}
                    >
                        Displayed disks and limits
                    </Title>
                    <AutoOrderToggle
                        resourceName=""
                        checked={widget?.settings?.automatic}
                        toggle={toggleAutomatic}
                    />
                    <Stack className={classes.resourceList}>
                        <Group className={classes.headerGroup}>
                            <Flex className={classes.headerLabel}>Path</Flex>
                            <Flex className={classes.headerLabel}>Highlight stages</Flex>
                        </Group>
                    </Stack>
                    {resourceList}
                </>
            )}
        </Stack>
    );
};

export default StorageResourcesDrawer;
