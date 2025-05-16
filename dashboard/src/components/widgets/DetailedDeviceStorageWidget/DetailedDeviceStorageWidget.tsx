import { Paper, Stack, Title } from "@mantine/core";

import { useElementSize } from "@mantine/hooks";
import { Disk } from "../../../types/api.types";
import { WidgetComponentProps } from "../../../types/components.types";
import DiskProgress from "../../display/DiskProgress/DiskProgress";
import classes from "./DeviceDisksWidget.module.css";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import { isEmpty } from "lodash";
import { safeObjectValues } from "../../../utils/object";

function DetailedDeviceStorageWidget({ data, settings, className, ...props }: WidgetComponentProps) {
    let { height, ref } = useElementSize();

    const prepareData = () => {
        if (!height || !data.disks) return data.disks ?? [];

        const numberOfSlots = Math.floor((height - 118) / 44);
        const visibleDisks = settings.disks.filter(({ hidden }) => !hidden).map(({ path }) => path);
        const diskData = visibleDisks.map((path: string) => data.disks[path]);

        if (settings.automatic) {
            return diskData
                .sort((a: Disk, b: Disk) => (a.storageCurrent / a.storageLimit < b.storageCurrent / b.storageLimit ? 1 : -1))
                .slice(0, numberOfSlots);
        }

        return diskData.slice(0, numberOfSlots);
    };

    const disksData = prepareData();

    return (
        <Paper
            ref={ref}
            {...props}
            className={`${classes.container} ${className}`}
            withBorder
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
                <Stack className={classes.progressBarStack}>
                    {disksData.map((disk: Disk, i) => (
                        <DiskProgress
                            key={i}
                            {...disk}
                        />
                    ))}
                </Stack>
            </Stack>
        </Paper>
    );
}

export default DetailedDeviceStorageWidget;
