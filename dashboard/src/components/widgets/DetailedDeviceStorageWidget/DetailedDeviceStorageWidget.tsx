import { Box, Stack } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { DiskInfo } from "../../../types/api.types";
import { WidgetContentProps } from "../../../types/components.types";
import DiskProgress from "../../display/DiskProgress/DiskProgress";
import classes from "./DetailedDeviceStorageWidget.module.css";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import { safeObjectValues } from "../../../utils/object";
import { useEffect } from "react";
import { isEqual } from "lodash";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";

function DetailedDeviceStorageWidget({ index, data, settings, ...props }: WidgetContentProps) {
    let { height, ref } = useElementSize();
    const { setWidgetSettings, getWidget } = useWidgets();
    const widget = getWidget(index);
    const disks: DiskInfo[] = data?.disksInfo ?? [];

    const updateSettings = () => {
        const resourceData = data?.disksInfo ?? [];
        const oldResourceSettings = settings?.disks ?? {};
        let newResourceSettings = {};

        resourceData.forEach(({ mountPoint }) => {
            if (oldResourceSettings[mountPoint]) return (newResourceSettings[mountPoint] = oldResourceSettings[mountPoint]);
            newResourceSettings[mountPoint] = { path: mountPoint, hidden: false, highlightStages: { yellow: 75, red: 90 } };
        });

        if (!isEqual(newResourceSettings, oldResourceSettings)) {
            setWidgetSettings(index, { ...settings, disks: newResourceSettings });
        }
    };

    useEffect(() => {
        updateSettings();
    }, []);

    useEffect(() => {
        updateSettings();
    }, [widget?.version, data, settings?.target]);

    const prepareData = () => {
        if (!height || !disks) return disks ?? [];

        const numberOfSlots = Math.floor(height / 44);
        const visibleDisksPaths = safeObjectValues(settings?.disks ?? {})
            .filter(({ hidden }) => !hidden)
            .map(({ path }) => path);

        const getDisk = (mountPoint: string) => disks.find((e) => e.mountPoint === mountPoint) as DiskInfo;
        const disksData = visibleDisksPaths?.map?.(getDisk).filter((e) => e) ?? disks;

        if (settings.automatic) {
            return disksData.sort((a: DiskInfo, b: DiskInfo) => (a.usage / a.capacity < b.usage / b.capacity ? 1 : -1)).slice(0, numberOfSlots);
        }

        return disksData.slice(0, numberOfSlots);
    };

    const preparedData = prepareData();

    return (
        <Box
            className={classes.container}
            {...props}
        >
            <Stack className={classes.stack}>
                <DeviceTitleOneLine
                    data={data}
                    mb="6"
                />
                <Stack
                    ref={ref}
                    className={classes.progressBarStack}
                >
                    {preparedData.map((disk: DiskInfo, i) => (
                        <DiskProgress
                            key={i}
                            highlightStages={settings?.disks?.[disk?.mountPoint]?.highlightStages ?? { red: 100, yellow: 100 }}
                            path={disk?.mountPoint}
                            usage={disk?.usage}
                            capacity={disk?.capacity}
                        />
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
}

export default DetailedDeviceStorageWidget;
