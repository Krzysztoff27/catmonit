import { Box, Flex } from "@mantine/core";
import WidgetLayout from "../../components/WidgetLayout/WidgetLayout";
import { useMemo, useState } from "react";
import WidgetDrawer from "../../components/WidgetDrawer/WidgetDrawer";
import { Layout, LayoutItem } from "../../types/reactGridLayout.types";
import WIDGETS_CONFIG from "../../config/widgets.config";
import { useParams } from "react-router-dom";
import WidgetMenu from "../../components/WidgetMenu/WidgetMenu";
import { WidgetData } from "../../types/api.types";

function Editor() {
    const { layoutName } = useParams();
    const [widgets, setWidgets] = useState<WidgetData[]>([
        {
            type: "DEVICE_DISKS",
            rect: { x: 0, y: 0, w: 2, h: 2 },
            data: { hostname: "Tux", ip: "10.10.100.1" },
        },
        {
            type: "DEVICE_DISKS",
            rect: { x: 2, y: 0, w: 2, h: 2 },
            data: { hostname: "Tux", ip: "10.10.100.1" },
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

    return (
        <>
            <Flex
                flex={1}
                h="100vh"
                pos="relative"
            >
                <WidgetDrawer
                    position="right"
                    size="xs"
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
                <WidgetLayout
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
