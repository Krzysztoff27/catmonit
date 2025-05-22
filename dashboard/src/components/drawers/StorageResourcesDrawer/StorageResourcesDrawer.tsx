import { Button, Flex, Group, NumberInput, ScrollArea, Stack, TextInput, Title } from "@mantine/core";
import { IconEye, IconEyeOff, IconGripVertical } from "@tabler/icons-react";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import AutoOrderToggle from "../../interactive/button/AutoOrderToggle/AutoOrderToggle";
import { safeObjectKeys, safeObjectValues } from "../../../utils/object";
import { WidgetPropertiesContentProps } from "../../../types/components.types";
import DeviceSelect from "../../interactive/input/DeviceSelect/DeviceSelect";
import classes from "./StorageResourcesDrawer.module.css";
import { useEffect, useMemo } from "react";
import { isEqual } from "lodash";

const StorageResourcesDrawer = ({ index }: WidgetPropertiesContentProps): React.JSX.Element => {
    const { setWidgetSettings, getWidgetData, getWidgetConfig, getData, getWidget } = useWidgets();
    const widget = getWidget(index);
    const data = getWidgetData(widget);
    const config = getWidgetConfig(widget);
    const dataSource: string = config.dataSource ?? "";
    const selectedDevice = widget?.settings?.target;
    const resourceKeyInData: string =
        {
            disks: "disksInfo",
            fileShares: "sharesInfo",
        }[dataSource] ?? "";
    const pathKey: string =
        {
            disks: "mountPoint",
            fileShares: "sharePath",
        }[dataSource] ?? "";

    const resourceData = data?.[resourceKeyInData] ?? [];

    const onDeviceChange = (target: string | null) => {
        if (!target) return;
        setWidgetSettings(index, { ...widget.settings, target, [dataSource]: {} });
    };

    const getResourceSettings = (path: string) => {
        return widget?.settings?.[dataSource]?.[path];
    };

    const toggleResourceHidden = (path: string) => {
        const newSettings = widget.settings;
        newSettings[dataSource][path].hidden = !newSettings[dataSource][path].hidden;
        setWidgetSettings(index, newSettings);
    };

    const toggleAutomatic = () => {
        const newSettings = widget.settings;
        newSettings.automatic = !newSettings.automatic;
        setWidgetSettings(index, newSettings);
    };

    const modifyHighlightStage = (path: string, stage: "yellow" | "red", value: number | string) => {
        const newSettings = widget.settings;
        if (!newSettings?.[dataSource]?.[path]?.highlightStages?.[stage]) return;
        newSettings[dataSource][path].highlightStages[stage] = value;
        setWidgetSettings(index, newSettings);
    };

    const resourceList = useMemo(
        () =>
            resourceData.map((resource, i: number) => {
                const path = resource[pathKey];
                const resourceSettings = getResourceSettings(path);
                return (
                    <Flex
                        key={i}
                        className={classes.resourceRow}
                    >
                        <IconGripVertical className={classes.iconGrip} />

                        <TextInput
                            value={path}
                            readOnly
                        />
                        <NumberInput
                            defaultValue={resourceSettings?.highlightStages?.yellow}
                            onChange={(val: number | string) => modifyHighlightStage(path, "yellow", val)}
                            min={0}
                            max={100}
                            step={1}
                            suffix="%"
                            className={classes.percentInput}
                        />
                        <NumberInput
                            defaultValue={resourceSettings?.highlightStages?.red}
                            onChange={(val: number | string) => modifyHighlightStage(path, "red", val)}
                            min={0}
                            max={100}
                            step={1}
                            suffix="%"
                            className={classes.percentInput}
                        />

                        <Button
                            variant="outline"
                            onClick={() => toggleResourceHidden(path)}
                            color={resourceSettings.hidden ? "var(--background-color-3)" : "var(--background-color-0)"}
                            className={classes.toggleButton}
                        >
                            {resourceSettings.hidden ? <IconEyeOff size={24} /> : <IconEye size={24} />}
                        </Button>
                    </Flex>
                );
            }),
        [widget?.settings.target, widget?.settings?.[resourceKeyInData]]
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
