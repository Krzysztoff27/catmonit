import { Title, Text, Select, SelectProps, Group, Table, Flex, Stack, Button } from "@mantine/core";
import { IconCheck, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState } from "react";
import { Device, DeviceDiskData, Disk, WidgetData } from "../../types/api.types";

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
            align="center"
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
                style={{ fontFamily: "monospace" }}
            >
                {device?.ip} {device?.mask}
            </Text>
        </Flex>
    );
};

function DeviceDiskDrawer() {
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const [visibilityState, setVisibilityState] = useState<any>(getVisibility());

    const handleDeviceChange = (value: string | null) => {
        setSelectedDevice(value);
    };

    const handleToggleVisibility = (uuid: string, path: string) => {
        const newVisibilityState = {...visibilityState};
        const key = `${uuid}-${path}`;

        newVisibilityState[key] = !newVisibilityState;
        setVisibilityState(newVisibilityState);
        saveVisibility(newVisibilityState);
    }

    const selectedDeviceData = devices.find((device) => device.uuid === selectedDevice);

    return (
        <>
            <Title
                order={4}
                mb="sm"
            >
                Choose device to display:
            </Title>
            <Select
                placeholder="Choose device"
                data={selectDeviceData}
                value={selectedDevice}
                onChange={handleDeviceChange}
                renderOption={customRenderOption}
            />

            {selectedDevice && selectedDeviceData && (
                <>
                    <Title
                        order={5}
                        mt="md"
                        mb="sm"
                    >
                        Disks for {selectedDeviceData.hostname}:
                    </Title>
                    <Stack gap="sm">
                        {selectedDeviceData.disks.map((disk) => (
                            <Flex
                                key={disk.path}
                                align="center"
                                justify="space-between"
                                w="100%"
                            >
                                <Text>{disk.path}</Text>
                                <Text
                                    c="var(--background-color-3)"
                                    style={{ fontFamily: "monospace" }}
                                >
                                    {disk.storageCurrent} GB / {disk.storageLimit} GB
                                </Text>
                                {/* <Button
                                    variant="outline"
                                    onClick={() => handleToggleVisibility(selectedDeviceData.uuid, disk.path)}
                                    color={isVisible ? "blue" : "gray"}
                                    leftIcon={isVisible ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                                >
                                    {isVisible ? "Hide" : "Show"}
                                </Button> */}

                            </Flex>
                        ))}
                    </Stack>
                </>
            )}
        </>
    );
}

export default DeviceDiskDrawer;
