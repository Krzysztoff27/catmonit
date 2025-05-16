import { Button, Center, Flex, Group, NumberInput, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconEye, IconEyeOff, IconGripVertical } from "@tabler/icons-react";
import { useState } from "react";
import DeviceSelect from "../../interactive/input/DeviceSelect/DeviceSelect";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { Disk } from "../../../types/api.types";
import AutoOrderToggle from "../../interactive/button/AutoOrderToggle/AutoOrderToggle";
import { safeObjectValues } from "../../../utils/object";

<<<<<<< HEAD
function DetailedDeviceStorageDrawer({ index }) {
    const { widgets, setWidgetSettings, getWidgetData, getData, getWidget } = useWidgets();
    const widget = getWidget(index);
    const widgetData = getWidgetData(widget);
    const selectedDevice = widget?.settings?.target;
=======
const devices: DeviceDiskData[] = [
    {
        uuid: "1234",
        hostname: "Tux",
        ip: "192.168.1.1",
        mask: "24",
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
        mask: "24",
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
>>>>>>> 01e978a1117b1d97ba2ee33f2604ffb484310a83

    const changeDevice = (target: string | undefined) => {
        let newDiskSettings = {};
        if (target) {
            const newData = getData("storage")[target];
            newDiskSettings = safeObjectValues(newData.disks).map((disk: Disk) => ({ path: disk.path, hidden: false }));
        }
        setWidgetSettings(index, { ...widget.settings, target, disks: newDiskSettings });
    };

    const isDiskHidden = (path: string) => {
        return widget?.settings?.disks?.find((disk: Disk) => disk.path === path).hidden;
    };

    const toggleDiskHidden = (path: string) => {
        const newSettings = widget.settings;
        const diskIndex = newSettings.disks.findIndex((disk: Disk) => disk.path === path);
        newSettings.disks[diskIndex].hidden = !newSettings.disks[diskIndex].hidden;
        setWidgetSettings(index, newSettings);
    };

    const toggleAutomatic = (path: string) => {
        const newSettings = widget.settings;
        newSettings.automatic = !newSettings.automatic;
        setWidgetSettings(index, newSettings);
    };

    return (
        <Stack gap="sm">
            <DeviceSelect
                value={widget?.settings?.target}
                onChange={changeDevice}
            />
            {selectedDevice && widgetData && (
                <>
                    <Title
                        order={5}
                        mt="lg"
                    >
                        Displayed disks and limits
                    </Title>
                    <AutoOrderToggle
                        resourceName=""
                        checked={widget?.settings?.automatic}
                        toggle={toggleAutomatic}
                    />
                    <Stack
                        mt="sm"
                        gap="sm"
                        w="100%"
                    >
                        <Group
                            w="100%"
                            pr="xl"
                        >
                            <Flex
                                flex="1"
                                fz="sm"
                                pl="xl"
                            >
                                Path
                            </Flex>
                            <Flex
                                flex="1"
                                fz="sm"
                            >
                                Highlight stages
                            </Flex>
                        </Group>

                        {safeObjectValues(widgetData.disks).map((disk: Disk, i: number) => {
                            const hidden = isDiskHidden(disk.path);
                            return (
                                <Flex
                                    key={i}
                                    align="center"
                                    justify="space-between"
                                    w="100%"
                                    gap="xs"
                                >
                                    <IconGripVertical color="var(--background-color-3)" />

                                    <TextInput
                                        value={disk.path}
                                        readOnly
                                    />

                                    <NumberInput
                                        defaultValue={75}
                                        min={0}
                                        max={100}
                                        step={1}
                                        suffix="%"
                                        w="30%"
                                    />

                                    <NumberInput
                                        defaultValue={90}
                                        min={0}
                                        max={100}
                                        step={1}
                                        suffix="%"
                                        w="30%"
                                    />

                                    <Button
                                        variant="outline"
                                        onClick={() => toggleDiskHidden(disk.path)}
                                        color={hidden ? "var(--background-color-3)" : "var(--background-color-0)"}
                                        bd="0"
                                        w="fit-content"
                                        h="fit-content"
                                        p="0"
                                    >
                                        {hidden ? <IconEyeOff size={24} /> : <IconEye size={24} />}
                                    </Button>
                                </Flex>
                            );
                        })}
                    </Stack>
                </>
            )}
        </Stack>
    );
}

export default DetailedDeviceStorageDrawer; // ! @TODO napisac ile dyskow sie wywietli przy tym rozmiarze
