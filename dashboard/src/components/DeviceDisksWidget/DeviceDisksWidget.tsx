import { Paper, PaperProps, Progress, Stack } from "@mantine/core";
import { useState } from "react";
import DeviceTitle from "../DeviceTitle/DeviceTitle";
import { Device, Disk } from "../../types/api.types";
import DiskProgress from "../DiskProgress/DiskProgress";

const DUMMY_DISKS = [
    { path: "/dev/sdc", storageCurrent: 720, storageLimit: 2048 },
    { path: "/dev/sda", storageCurrent: 1600, storageLimit: 2048 },
    { path: "/dev/sdb", storageCurrent: 2000, storageLimit: 2048 },
];

interface DeviceDisksWidgetProps extends PaperProps {
    data: Device;
}

function DeviceDisksWidget({ data, ...props }: DeviceDisksWidgetProps) {
    const [disksData, setDisksData] = useState<Disk[]>(DUMMY_DISKS);

    return (
        <Paper
            w="100%"
            flex="1"
            bg="var(--background-color-6)"
            {...props}
        >
            <Stack
                p="xs"
                gap="xs"
            >
                <DeviceTitle
                    name={data.hostname}
                    address={data.ip}
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
