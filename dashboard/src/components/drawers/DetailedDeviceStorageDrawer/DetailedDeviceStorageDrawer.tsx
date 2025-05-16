import { Button, Flex, Group, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import { IconEye, IconEyeOff, IconGripVertical } from "@tabler/icons-react";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { Disk } from "../../../types/api.types";
import AutoOrderToggle from "../../interactive/button/AutoOrderToggle/AutoOrderToggle";
import { safeObjectValues } from "../../../utils/object";
import { DrawerContentProps } from "../../../types/components.types";
import TargetSelect from "../../interactive/input/TargetSelect/TargetSelect";

function DetailedDeviceStorageDrawer({ index }: DrawerContentProps) {
    const { setWidgetSettings, getWidgetData, getData, getWidget } = useWidgets();
    const widget = getWidget(index);
    const widgetData = getWidgetData(widget);
    const selectedDevice = widget?.settings?.target;

    const onDeviceChange = (target: string | null) => {
        if (!target) return;
        const newData = getData("storage")[target];
        const newDisks = safeObjectValues(newData.disks);
        const newDiskSettings = newDisks.map(({ path }: Disk) => ({ path, hidden: false }));
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
            <TargetSelect
                index={index}
                widget={widget}
                onChange={onDeviceChange}
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

export default DetailedDeviceStorageDrawer; // ! TODO napisac ile dyskow sie wywietli przy tym rozmiarze
