import { Title, Paper, Text, Select, SelectProps, Group, Flex, Stack, Button, NumberInput, Grid } from "@mantine/core";
import { IconCheck, IconEye, IconEyeOff, IconGripVertical } from "@tabler/icons-react";
import { useState } from "react";
import { DeviceDiskData } from "../../types/api.types";
import DeviceSelect from "../DeviceSelect/DeviceSelect";

const devices: DeviceDiskData[] = [
    {
        uuid: "1234",
        hostname: "Tux",
        ip: "192.168.1.1",
        mask: "/24",
        disks: [
            { path: "/dev/sda", storageLimit: 100, storageCurrent: 50 },
            { path: "/dev/sdb", storageLimit: 100, storageCurrent: 80 },
            { path: "/dev/sdc", storageLimit: 50, storageCurrent: 15 },
        ],
    },
    {
        uuid: "5678",
        hostname: "Kamel",
        ip: "192.168.1.2",
        mask: "/24",
        disks: [
            { path: "/dev/sda", storageLimit: 500, storageCurrent: 200 },
            { path: "/dev/sdb", storageLimit: 1000, storageCurrent: 800 },
            { path: "/dev/sdc", storageLimit: 2000, storageCurrent: 1500 },
        ],
    },
    {
        uuid: "91011",
        hostname: "Bro",
        ip: "192.168.1.3",
        mask: "/25",
        disks: [
            { path: "/dev/sda", storageLimit: 16000, storageCurrent: 200 },
            { path: "/dev/sdb", storageLimit: 12200, storageCurrent: 800 },
            { path: "/dev/sdc", storageLimit: 22000, storageCurrent: 1500 },
        ],
    },
];

const selectDeviceData = devices.map((device) => ({
    value: device.uuid,
    label: `${device.hostname} (${device.ip}${device.mask})`,
}));

function DeviceStorageDrawer() {
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

    const handleDeviceChange = (value: string | null) => {
        setSelectedDevice(value);
    };

    const selectedDeviceData = devices.find((device) => device.uuid === selectedDevice);

    return (
        <>
            <Title
                order={4}
                mb="md"
            >
                Widget properties
            </Title>
            <Grid
                fz = "sm"
                justify="center"
                align="center"
                columns={4}
                gutter="sm"
                mb="lg"
            >
                <Grid.Col
                    span={1}
                    py="0"
                >
                    Width
                </Grid.Col>
                <Grid.Col
                    span={1}
                    py="0"
                >
                    Height
                </Grid.Col>
                <Grid.Col
                    span={1}
                    py="0"
                >
                    X position
                </Grid.Col>
                <Grid.Col
                    span={1}
                    py="0"
                >
                    Y position
                </Grid.Col>

                <Grid.Col span={1}>
                    <NumberInput
                        min={2}
                        max={4}
                    />
                </Grid.Col>
                <Grid.Col span={1}>
                    <NumberInput
                        min={2}
                        max={4}
                    />
                </Grid.Col>
                <Grid.Col span={1}>
                    <NumberInput
                        min={1}
                        max={100}
                    />
                </Grid.Col>
                <Grid.Col span={1}>
                    <NumberInput
                        min={1}
                        max={100}
                    />
                </Grid.Col>
            </Grid>
            <DeviceSelect
                placeholder="Choose device"
                data={devices}
                value={selectedDevice}
                onChange={handleDeviceChange}
            />
        </>
    );
}

export default DeviceStorageDrawer;
// ! @TODO napisac ile dyskow sie wywietli przy tym rozmiarze
