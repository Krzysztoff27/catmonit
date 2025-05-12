import { Button, Flex, Grid, Group, NumberInput, Paper, SelectProps, Stack, Text, Title } from "@mantine/core";
import { IconCheck, IconEye, IconEyeOff, IconGripVertical } from "@tabler/icons-react";
import { useState } from "react";
import { DeviceDiskData } from "../../../types/api.types";
import DeviceSelect from "../../interactive/input/DeviceSelect/DeviceSelect";

const devices: DeviceDiskData[] = [
    {
        uuid: "1234",
        hostname: "Tux",
        ip: "192.168.1.1",
        mask: "/24",
        disks: [
            {
                path: "/dev/sda",
                storageLimit: 100,
                storageCurrent: 50,
            },
            {
                path: "/dev/sdb",
                storageLimit: 100,
                storageCurrent: 80,
            },
            {
                path: "/dev/sdc",
                storageLimit: 50,
                storageCurrent: 15,
            },
        ],
    },
    {
        uuid: "5678",
        hostname: "Kamel",
        ip: "192.168.1.2",
        mask: "/24",
        disks: [
            {
                path: "/dev/sda",
                storageLimit: 500,
                storageCurrent: 200,
            },
            {
                path: "/dev/sdb",
                storageLimit: 1000,
                storageCurrent: 800,
            },
            {
                path: "/dev/sdc",
                storageLimit: 2000,
                storageCurrent: 1500,
            },
        ],
    },
    {
        uuid: "91011",
        hostname: "Bro",
        ip: "192.168.1.3",
        mask: "/25",
        disks: [
            {
                path: "/dev/sda",
                storageLimit: 16000,
                storageCurrent: 200,
            },
            {
                path: "/dev/sdb",
                storageLimit: 12200,
                storageCurrent: 800,
            },
            {
                path: "/dev/sdc",
                storageLimit: 22000,
                storageCurrent: 1500,
            },
        ],
    },
];
const selectDeviceData = devices.map((device) => ({
    value: device.uuid,
    label: `${device.hostname} (${device.ip}${device.mask})`,
}));

const getVisibility = () => {
    const storedVisibility = localStorage.getItem("visibilityState");
    return storedVisibility ? JSON.parse(storedVisibility) : {};
};

const saveVisibility = (visibility: any) => {
    localStorage.setItem("visibilityState", JSON.stringify(visibility));
};

const customRenderOption: SelectProps["renderOption"] = ({ option, checked }) => {
    const device = devices.find((device) => device.uuid === option.value);
    return (
        <Flex
            justify="space-between"
            w="100%"
        >
            <Flex
                gap="xs"
                align="center"
            >
                {checked && <IconCheck size={16} />}
                <Text>{device?.hostname}</Text>
            </Flex>
            <Text
                c="var(--background-color-3)"
                style={{
                    fontFamily: "monospace",
                }}
            >
                {device?.ip} {device?.mask}
            </Text>
        </Flex>
    );
};

function DetailedDeviceStorageDrawer() {
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [visibilityState, setVisibilityState] = useState<any>(getVisibility());

    const handleDeviceChange = (value: string | null) => {
        setSelectedDevice(value);
    };

    const handleToggleVisibility = (uuid: string, path: string) => {
        const newVisibilityState = { ...visibilityState };
        const key = `${uuid}-${path}`;
        newVisibilityState[key] = !newVisibilityState[key];
        setVisibilityState(newVisibilityState);
        saveVisibility(newVisibilityState);
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
                fz="sm"
                justify="center"
                align="center"
                columns={4}
                gutter="xs"
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
            {selectedDevice && selectedDeviceData && (
                <>
                    <Title
                        order={5}
                        mt="lg"
                        mb="sm"
                    >
                        Displayed disks and limits
                    </Title>
                    {/* <Grid justify="flex-end" gutter={0}>
           <Grid.Col span="content">
               <Text w={22}>Warn</Text>
           </Grid.Col>
           <Grid.Col span="content">
               <Text w={22}>Error</Text>
           </Grid.Col>
        </Grid> */}

                    {/* <Group gap="xl">
           <Text w={22}>Warn</Text>
           <Text w={22}>Error</Text>
        </Group> */}

                    <Stack
                        gap="sm"
                        w="100%"
                    >
                        <Flex
                            justify="space-between"
                            align="center"
                            w="100%"
                            px="xl"
                        >
                            <Text
                                w="55%"
                                fz="sm"
                                pb={0}
                            >
                                Path
                            </Text>
                            <Flex
                                w="55%"
                                justify="space-between"
                            >
                                <Text
                                    w="40%"
                                    fz="sm"
                                    pb={0}
                                >
                                    Warning
                                </Text>
                                <Text
                                    w="40%"
                                    fz="sm"
                                    pb={0}
                                >
                                    Critical
                                </Text>
                            </Flex>
                        </Flex>

                        {selectedDeviceData.disks.map((disk) => {
                            const key = `${selectedDeviceData.uuid}-${disk.path}`;
                            const isVisible = visibilityState[key];
                            return (
                                <Flex
                                    key={disk.path}
                                    align="center"
                                    justify="space-between"
                                    w="100%"
                                >
                                    <IconGripVertical color="var(--background-color-3)" />

                                    <Paper
                                        w="40%"
                                        bg="var(--background-color-6)"
                                        radius="8"
                                        bd="1px solid var(--background-color-5)"
                                    >
                                        <Group
                                            gap="0"
                                            px="10"
                                            py="6"
                                        >
                                            <Text fz="xs">{disk.path}</Text>
                                        </Group>
                                    </Paper>

                                    <Paper
                                        w="22%"
                                        bg="var(--background-color-6)"
                                        radius="8"
                                        bd="1px solid var(--background-color-5)"
                                    >
                                        <NumberInput
                                            defaultValue={75}
                                            min={0}
                                            max={100}
                                            step={1}
                                            suffix="%"
                                        />
                                    </Paper>

                                    <Paper
                                        w="22%"
                                        bg="var(--background-color-6)"
                                        radius="8"
                                        bd="1px solid var(--background-color-5)"
                                    >
                                        <NumberInput
                                            defaultValue={90}
                                            min={0}
                                            max={100}
                                            step={1}
                                            suffix="%"
                                        />
                                    </Paper>

                                    <Button
                                        variant="outline"
                                        onClick={() => handleToggleVisibility(selectedDeviceData.uuid, disk.path)}
                                        color={isVisible ? "var(--background-color-0)" : "var(--background-color-3)"}
                                        bd="0"
                                        w="fit-content"
                                        h="fit-content"
                                        p="0"
                                    >
                                        {isVisible ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                                    </Button>
                                </Flex>
                            );
                        })}
                    </Stack>
                </>
            )}
        </>
    );
}

export default DetailedDeviceStorageDrawer; // ! @TODO napisac ile dyskow sie wywietli przy tym rozmiarze
