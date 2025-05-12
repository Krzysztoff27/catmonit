import { Paper, Stack, Title } from "@mantine/core";

import { useElementSize } from "@mantine/hooks";
import { Disk } from "../../../types/api.types";
import { WidgetComponentProps } from "../../../types/components.types";
import DeviceTitleSmall from "../../display/DeviceTitle/DeviceTitleSmall";
import DiskProgress from "../../display/DiskProgress/DiskProgress";
import classes from "./DeviceDisksWidget.module.css";
const DUMMY_DISKS = [
    {
        path: "/dev/sdc",
        storageCurrent: 720,
        storageLimit: 2048,
    },
    {
        path: "/dev/sda",
        storageCurrent: 1600,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdb",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdd",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sde",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdf",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
    {
        path: "/dev/sdh",
        storageCurrent: 2000,
        storageLimit: 2048,
    },
];

function DetailedDeviceStorageWidget({ data, className, ...props }: WidgetComponentProps) {
    let { height, ref } = useElementSize();
    const disksData = DUMMY_DISKS.slice(0, Math.floor((height - 118) / 44));
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
                <DeviceTitleSmall
                    name={data.hostname}
                    address={data.ip}
                    mb="6"
                />
                <Stack className={classes.progressBarStack}>
                    {height &&
                        disksData.map((disk: Disk, i) => (
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
