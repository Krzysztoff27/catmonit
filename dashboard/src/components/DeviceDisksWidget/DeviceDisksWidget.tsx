import { Paper, Stack, Title } from "@mantine/core";
import { useState } from "react";
import DeviceTitle from "../DeviceTitle/DeviceTitle";
import { Disk } from "../../types/api.types";
import DiskProgress from "../DiskProgress/DiskProgress";
import { WidgetComponentProps } from "../../types/components.types";
import DeviceTitleSmall from "../DeviceTitle/DeviceTitleSmall";

const DUMMY_DISKS = [
    { path: "/dev/sdc", storageCurrent: 720, storageLimit: 2048 },
    { path: "/dev/sda", storageCurrent: 1600, storageLimit: 2048 },
    { path: "/dev/sdb", storageCurrent: 2000, storageLimit: 2048 },
];

function DeviceDisksWidget({ data, settings, ...props }: WidgetComponentProps) {
    const [disksData, setDisksData] = useState<Disk[]>(DUMMY_DISKS);

    return (
        <Paper
            flex="1"
            bg="var(--background-color-6)"
            {...props}
        >
            <Stack
                p="md"
                gap="xs"
            >
                <Title
                    order={3}
                    fw="600"
                >
                    Storage
                </Title>
                <DeviceTitleSmall
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
