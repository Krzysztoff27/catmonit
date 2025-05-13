import { Flex } from "@mantine/core";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import WidgetBoard from "../../components/layout/WidgetBoard/WidgetBoard";
import WidgetDrawer from "../../components/layout/WidgetDrawer/WidgetDrawer";
import WidgetMenu from "../../components/layout/WidgetMenu/WidgetMenu";
import WIDGETS_CONFIG from "../../config/widgets.config";
import { Layout, LayoutItem } from "../../types/reactGridLayout.types";
import useWidgetLayout from "../../hooks/useWidgetLayout";
import useWidgetDrawer from "../../hooks/useWidgetDrawer";

function Editor() {
    const { layoutName } = useParams();
    const { widgets, createWidget, getDisplayableLayoutData, setWidgetPositions, getComponent, deleteWidget } = useWidgetLayout(layoutName ?? "");
    const { isOpened, selected, onWidgetDragStart, onWidgetDragStop, closeWidgetDrawer, DrawerComponent } = useWidgetDrawer(widgets);

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
                    opened={isOpened}
                    onClose={closeWidgetDrawer}
                >
                    <DrawerComponent />
                </WidgetDrawer>

                <WidgetMenu
                    currentDropType={currentDropType}
                    setCurrentDropType={setCurrentDropType}
                />
                <WidgetBoard
                    widgets={widgets}
                    getComponent={getComponent}
                    deleteWidget={deleteWidget}
                    layout={getDisplayableLayoutData()}
                    updateLayout={setWidgetPositions}
                    selected={selected}
                    onDragStart={onWidgetDragStart}
                    onDragStop={onWidgetDragStop}
                    onDrop={onDrop}
                    droppingItem={currentDroppingItem}
                />
            </Flex>
        </>
    );
}

export default Editor;
