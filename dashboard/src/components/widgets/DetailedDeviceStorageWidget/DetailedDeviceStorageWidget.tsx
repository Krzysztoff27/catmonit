import { Box, Stack } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { DiskInfo } from "../../../types/api.types";
import { WidgetContentProps } from "../../../types/components.types";
import DiskProgress from "../../display/DiskProgress/DiskProgress";
import classes from "./DetailedDeviceStorageWidget.module.css";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import { safeObjectValues } from "../../../utils/object";

function DetailedDeviceStorageWidget({ data, settings, ...props }: WidgetContentProps) {
    let { height, ref } = useElementSize();
    const disks: DiskInfo[] = data?.disksInfo ?? [];

    const prepareData = () => {
        if (!height || !disks) return disks ?? [];

        const numberOfSlots = Math.floor(height / 44);
        const visibleDisksPaths = safeObjectValues(settings?.disks ?? {})
            .filter(({ hidden }) => !hidden)
            .map(({ path }) => path);

        const getDisk = (mountPoint: string) => disks.find((e) => e.mountPoint === mountPoint) as DiskInfo;
        const disksData = visibleDisksPaths?.map?.(getDisk) ?? disks;

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
