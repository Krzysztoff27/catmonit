import { Box, Stack, Title } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { DiskInfo, Device } from "../../../types/api.types";
import { WidgetContentProps } from "../../../types/components.types";
import DiskProgress from "../../display/DiskProgress/DiskProgress";
import classes from "./DetailedDeviceStorageWidget.module.css";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import { safeObjectValues } from "../../../utils/object";

function DetailedDeviceStorageWidget({ data, settings, ...props }: WidgetContentProps) {
    let { height, ref } = useElementSize();
    const getDiskPath = (disk: DiskInfo) => disk.mountPoint;

    const prepareData = () => {
        if (!height || !data?.DisksInfo) return safeObjectValues(data?.DisksInfo) ?? [];

        const numberOfSlots = Math.floor((height + 12) / 44);
        const visibleDisksPaths = safeObjectValues(settings?.disks ?? {})
            .filter(({ hidden }) => !hidden)
            .map(({ path }) => path);

        // Find disks matching visible paths, fallback to all disks if none specified
        const disksData = visibleDisksPaths.length > 0
            ? visibleDisksPaths
                .map(path => safeObjectValues(data.DisksInfo).find(disk => getDiskPath(disk) === path))
                .filter(Boolean) as DiskInfo[]
            : safeObjectValues(data.DisksInfo);

        if (settings.automatic) {
            return disksData
                .sort((a, b) => (a.Usage / a.Capacity < b.Usage / b.Capacity ? 1 : -1))
                .slice(0, numberOfSlots);
        }

        return disksData.slice(0, numberOfSlots);
    };

    const disksData = prepareData();

    return (
        <Box
            className={classes.container}
            {...props}
        >
            <Stack className={classes.stack}>
                <Title
                    order={3}
                    className={classes.title}
                >
                    Storage
                </Title>
                <DeviceTitleOneLine
                    data={data}
                    mb="6"
                />
                <Stack
                    ref={ref}
                    className={classes.progressBarStack}
                >
                    {disksData.map((disk: DiskInfo, i) => (
                        
                        <DiskProgress
                            key={i}
                            highlightStages={settings?.disks?.[getDiskPath(disk)]?.highlightStages ?? { red: 100, yellow: 100 }}
                            path={getDiskPath(disk)}
                            usage={disk.usage}
                            capacity={disk.capacity}
                        />
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
}

export default DetailedDeviceStorageWidget;