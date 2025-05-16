import { Flex } from "@mantine/core";
import React, { useMemo, useState } from "react";
import WIDGETS_CONFIG from "../../../config/widgets.config";
import { Layout, LayoutItem } from "../../../types/reactGridLayout.types";
import WidgetBoard from "../WidgetBoard/WidgetBoard";
import WidgetMenu from "../WidgetMenu/WidgetMenu";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import useWidgetDrawer from "../../../hooks/useWidgetDrawer";
import WidgetDrawer from "../WidgetDrawer/WidgetDrawer";

const Dashboard = (): React.JSX.Element => {
    const { widgets, createWidget } = useWidgets();
    const { DrawerContent, closeWidgetDrawer, isOpened, onWidgetDragStart, onWidgetDragStop, selected } = useWidgetDrawer(widgets);

    const [currentDropType, setCurrentDropType] = useState<string | null>(null);
    const onDrop = (layout: Layout, item: LayoutItem) => {
        createWidget(currentDropType, item);
    };

    const currentDroppingItem = useMemo(() => {
        if (!currentDropType) return { i: "__droppable__", w: 2, h: 2 };
        const { minW, minH } = WIDGETS_CONFIG[currentDropType].limits;
        return { i: "__droppable__", w: minW, h: minH };
    }, [currentDropType]);

    console.log(selected, DrawerContent);

    return (
        <Flex
            flex={1}
            h="100vh"
            pos="relative"
        >
            {
                <WidgetDrawer
                    component={DrawerContent!}
                    index={selected!}
                    position="right"
                    size="sm"
                    overlayProps={{ backgroundOpacity: 0 }}
                    opened={isOpened}
                    onClose={closeWidgetDrawer}
                />
            }

            <WidgetMenu
                currentDropType={currentDropType}
                setCurrentDropType={setCurrentDropType}
            />
            <WidgetBoard
                selected={selected}
                onDragStart={onWidgetDragStart}
                onDragStop={onWidgetDragStop}
                onDrop={onDrop}
                droppingItem={currentDroppingItem}
            />
        </Flex>
    );
};

export default Dashboard;
