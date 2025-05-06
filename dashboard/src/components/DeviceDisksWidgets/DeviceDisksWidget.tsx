import { Paper, Progress, Stack } from "@mantine/core";
import { useState } from "react";
import DeviceTitle from "../DeviceTitle/DeviceTitle";
import { Device, Disk } from "../../types/api.types";
import DiskProgress from "../DiskProgress/DiskProgress";

const DUMMY_DISKS = [
    { path: "/dev/sdc", storageCurrent: 720, storageLimit: 2048 },
    { path: "/dev/sda", storageCurrent: 1600, storageLimit: 2048 },
    { path: "/dev/sdb", storageCurrent: 2000, storageLimit: 2048 },
];

interface DeviceDisksWidgetProps {
    device: Device;
}

function DeviceDisksWidget({ device }: DeviceDisksWidgetProps) {
    const [disksData, setDisksData] = useState<Disk[]>(DUMMY_DISKS);

    return (
        <Paper
            h="300px"
            w="260px"
            bg="var(--background-color-9)"
        >
            <Stack
                p="xs"
                gap="xs"
            >
                <DeviceTitle
                    name={device.hostname}
                    address={device.ip}
                    mb="lg"
                />
                {disksData.map((disk: Disk, i) => (
                    <DiskProgress
                        key={i}
                        {...disk}
                    />
                ))}
            </Stack>
        </Paper>
    );
}

export default DeviceDisksWidget;
