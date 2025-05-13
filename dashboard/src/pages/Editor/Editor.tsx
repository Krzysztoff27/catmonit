import { Box, Flex } from "@mantine/core";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import WidgetBoard from "../../components/layout/WidgetBoard/WidgetBoard";
import WidgetDrawer from "../../components/layout/WidgetDrawer/WidgetDrawer";
import WidgetMenu from "../../components/layout/WidgetMenu/WidgetMenu";
import WIDGETS_CONFIG from "../../config/widgets.config";
import { WidgetData } from "../../types/api.types";
import { Layout, LayoutItem } from "../../types/reactGridLayout.types";

function Editor() {
    const { layoutName } = useParams();
    const [widgets, setWidgets] = useState<WidgetData[]>([
        {
            type: "STORAGE_ALERTS",
            rect: { x: 0, y: 0, w: 5, h: 2 },
            data: { hostname: "Tux", ip: "10.10.100.1" },
        },
        {
            type: "DETAILED_DEVICE_STORAGE",
            rect: { x: 2, y: 0, w: 2, h: 2 },
            data: { hostname: "Tux", ip: "10.10.100.1" },
        },
        {
            type: "OVERALL_DEVICE_STORAGE",
            rect: { x: 4, y: 2, w: 2, h: 2 },
            data: {
                uuid: "device-1",
                hostname: "Tux",
                ip: "10.50.100.1",
                mask: "255.255.255.0",
                disks: [
                    { path: "/dev/sda1", storageLimit: 100, storageCurrent: 70 },
                    { path: "/dev/sdb1", storageLimit: 50, storageCurrent: 10 },
                ],
            },
        },
    ]);

    const [widgetDrawerOpened, setWidgetDrawerOpened] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const [currentDropType, setCurrentDropType] = useState<string | null>(null);

    const closeWidgetDrawer = () => {
        setWidgetDrawerOpened(false);
        setSelected(null);
    };

    let clicked = false;

    const onDragStart = () => {
        clicked = true;
        setTimeout(() => (clicked = false), 500);
    };

    const onDragStop = (_: Layout, before: LayoutItem, after: LayoutItem) => {
        if (!clicked || JSON.stringify(before) !== JSON.stringify(after)) return;
        setSelected(after.i);
        setWidgetDrawerOpened(true);
    };

    const onDrop = (layout: Layout, item: LayoutItem) => {
        setWidgets((prev) => [
            ...prev,
            {
                type: currentDropType,
                data: {},
                rect: {
                    x: item.x,
                    y: item.y,
                    h: item.h,
                    w: item.w,
                },
            } as WidgetData,
        ]);
    };

    const DrawerComponent = selected ? WIDGETS_CONFIG[widgets[selected].type].drawer : Box;

    const currentDroppingItem = useMemo(() => {
        if (!currentDropType) return { i: "__droppable__", w: 2, h: 2 };
        const { minW, minH } = WIDGETS_CONFIG[currentDropType].limits;
        return { i: "__droppable__", w: minW, h: minH };
    }, [currentDropType]);

    console.log(currentDropType);

    return (
        <>
            <Flex
                flex={1}
                h="100vh"
                pos="relative"
            >
                <WidgetDrawer
                    position="right"
                    size="sm"
                    overlayProps={{ backgroundOpacity: 0 }}
                    opened={widgetDrawerOpened}
                    onClose={closeWidgetDrawer}
                >
                    <DrawerComponent />
                </WidgetDrawer>

                <WidgetMenu
                    currentDropType={currentDropType}
                    setCurrentDropType={setCurrentDropType}
                />
                <WidgetBoard
                    selected={selected}
                    setWidgets={setWidgets}
                    widgets={widgets}
                    onDragStart={onDragStart}
                    onDragStop={onDragStop}
                    onDrop={onDrop}
                    droppingItem={currentDroppingItem}
                />
            </Flex>
        </>
    );
}

export default Editor;
