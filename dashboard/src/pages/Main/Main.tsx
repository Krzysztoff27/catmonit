import { useMantineColorScheme, Button, Flex } from "@mantine/core";
import WidgetLayout from "../../components/WidgetLayout/WidgetLayout";
import { useState } from "react";
import WidgetDrawer from "../../components/WidgetDrawer/WidgetDrawer";
import { useDisclosure } from "@mantine/hooks";
import { Layout, LayoutItem } from "../../types/reactGridLayout.types";

function Main() {
    const { setColorScheme, clearColorScheme } = useMantineColorScheme();
    const [widgets, setWidgets] = useState([
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

    return (
        <>
            <Flex
                flex={1}
                h="100vh"
            >
                <WidgetDrawer
                    position="right"
                    size="xs"
                    overlayProps={{ backgroundOpacity: 0 }}
                    opened={widgetDrawerOpened}
                    onClose={closeWidgetDrawer}
                ></WidgetDrawer>
                <WidgetLayout
                    selected={selected}
                    setWidgets={setWidgets}
                    widgets={widgets}
                    onDragStart={onDragStart}
                    onDragStop={onDragStop}
                />
            </Flex>
        </>
    );
}

export default Main;
