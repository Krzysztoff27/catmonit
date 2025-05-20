import { Box, Stack, Title } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { Disk } from "../../../types/api.types";
import { WidgetContentProps } from "../../../types/components.types";
import DiskProgress from "../../display/DiskProgress/DiskProgress";
import classes from "./DetailedDeviceStorageWidget.module.css";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import { safeObjectValues } from "../../../utils/object";
import Widget from "../../layout/Widget/Widget";

function DetailedDeviceStorageWidget({ data, settings, ...props }: WidgetContentProps) {
    let { height, ref } = useElementSize();

    const prepareData = () => {
        if (!height || !data?.disks) return safeObjectValues(data?.disks) ?? [];

        const numberOfSlots = Math.floor((height + 12) / 44);
        const visibleDisks = safeObjectValues(settings?.disks)?.filter(({ hidden }) => !hidden).map(({ path }) => path);
        const disksData = visibleDisks?.map((path: string) => data.disks[path]) ?? safeObjectValues(data.disks);

        if (settings.automatic) {
            return disksData
                .sort((a: Disk, b: Disk) => (a.storageCurrent / a.storageLimit < b.storageCurrent / b.storageLimit ? 1 : -1))
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
                    {disksData.map((disk: Disk, i) => (
                        <DiskProgress
                            key={i}
                            highlightStages={settings?.disks?.[disk.path]?.highlightStages ?? {red: 100, yellow: 100}}
                            {...disk}
                        />
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
}

export default DetailedDeviceStorageWidget;
