import { Paper, Stack, Title } from "@mantine/core";

import { useElementSize } from "@mantine/hooks";
import { Disk } from "../../../types/api.types";
import { WidgetComponentProps } from "../../../types/components.types";
import DiskProgress from "../../display/DiskProgress/DiskProgress";
import classes from "./DeviceDisksWidget.module.css";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";

function DetailedDeviceStorageWidget({ data, settings, className, ...props }: WidgetComponentProps) {
    let { height, ref } = useElementSize();

    const prepareData = () => {
        if (!height) return data.disks ?? [];
        return data?.disks?.slice?.(0, Math.floor((height - 118) / 44)) ?? [];
    };

    const disksData = prepareData();
    console.log(data, disksData);

    return (
        <Paper
            ref={ref}
            {...props}
            className={`${classes.container} ${className}`}
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
