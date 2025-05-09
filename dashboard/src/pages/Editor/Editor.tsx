import { Flex } from "@mantine/core";
import WidgetLayout from "../../components/WidgetLayout/WidgetLayout";
import { useState } from "react";
import WidgetDrawer from "../../components/WidgetDrawer/WidgetDrawer";
import { Layout, LayoutItem } from "../../types/reactGridLayout.types";
import WIDGETS_CONFIG from "../../config/widgets.config";
import { useParams } from "react-router-dom";

function Editor() {
    const { layoutName } = useParams();
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

    const DrawerComponent = selected ? WIDGETS_CONFIG[widgets[selected].type].drawer : <></>;
    
    return (
        <>
            <Flex
                flex={1}
                h="100vh"
            >
                <WidgetDrawer
                    position="right"
                    size="sm"
                    overlayProps={{ backgroundOpacity: 0 }}
                    opened={widgetDrawerOpened}
                    onClose={closeWidgetDrawer}
                >
                <DrawerComponent/>
                </WidgetDrawer>
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

export default Editor;
