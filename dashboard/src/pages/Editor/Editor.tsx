import { Flex } from "@mantine/core";
import React, { useMemo, useState } from "react";
import { useWidgets } from "../../contexts/WidgetContext/WidgetContext";
import { Layout, LayoutItem } from "../../types/reactGridLayout.types";
import WIDGETS_CONFIG from "../../config/widgets.config";
import WidgetBoard from "../../components/layout/WidgetBoard/WidgetBoard";
import FloatingControls from "../../components/layout/FloatingControls/FloatingControls";

const Editor = (): React.JSX.Element => {
    const { createWidget } = useWidgets();

    const [currentDropType, setCurrentDropType] = useState<string | null>(null);
    const onDrop = (layout: Layout, item: LayoutItem) => {
        createWidget(currentDropType, item);
    };

    const currentDroppingItem = useMemo(() => {
        if (!currentDropType) return { i: "__droppable__", w: 2, h: 2 };
        const { minW, minH } = WIDGETS_CONFIG[currentDropType].limits;
        return { i: "__droppable__", w: minW, h: minH };
    }, [currentDropType]);

    return (
        <Flex
            flex={1}
            h="100vh"
        >
            {/* <WidgetDrawer
                component={DrawerContent!}
                index={selected!}
                position="right"
                size="sm"
                overlayProps={{ backgroundOpacity: 0 }}
                opened={isOpened}
                onClose={closeWidgetDrawer}
            /> */}

            <WidgetBoard
                onDrop={onDrop}
                droppingItem={currentDroppingItem}
            />

            <FloatingControls
                currentDropType={currentDropType}
                setCurrentDropType={setCurrentDropType}
            />
        </Flex>
    );
};

export default Editor;
