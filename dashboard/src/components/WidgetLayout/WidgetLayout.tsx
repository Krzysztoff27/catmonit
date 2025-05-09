import { ActionIcon, Flex } from "@mantine/core";
import { useElementSize, useViewportSize } from "@mantine/hooks";
import GridLayout from "react-grid-layout";
import WIDGETS_CONFIG, { GRID_SIZE_PX } from "../../config/widgets.config";
import { WidgetData } from "../../types/api.types";
import { WidgetLayoutProps } from "../../types/components.types";
import { IconX } from "@tabler/icons-react";
import { Layout, LayoutItem } from "../../types/reactGridLayout.types";

function WidgetLayout({
    widgets,
    setWidgets,
    selected,
    onDragStart,
    onDrag,
    onDragStop,
    onResizeStart,
    onResize,
    onResizeStop,
    onDrop,
    droppingItem,
}: WidgetLayoutProps) {
    const { width } = useViewportSize();
    const cols = Math.floor(width / GRID_SIZE_PX);
    const layoutWidth = cols * GRID_SIZE_PX;

    const getLimits = (widget: WidgetData) => WIDGETS_CONFIG[widget.type].limits;
    const getComponent = (widget: WidgetData) => WIDGETS_CONFIG[widget.type].component;

    const widgetTypes = widgets.map((widget) => widget.type);
    const layout: Layout = widgets.map(
        (widget: WidgetData, i) =>
            ({
                i: `${i}`,
                ...widget.rect,
                ...getLimits(widget),
            } as LayoutItem)
    );

    const updateLayout = (newLayout: Layout) => {
        setWidgets((prev: WidgetData[]) =>
            prev.map((widget: WidgetData, i) => {
                const { x, y, w, h } = newLayout[i];

                return {
                    data: widget.data,
                    rect: {
                        x,
                        y,
                        w,
                        h,
                    },
                    type: widgetTypes[i],
                } as WidgetData;
            })
        );
    };

    const updateWidgetData = (widgetNumber, newData) => {
        setWidgets((prev: WidgetData[]) => {
            prev[widgetNumber].data = newData;
            return prev;
        });
    };

    const onDelete = (widgetNumber) => {
        setWidgets((prev: WidgetData[]) => prev.filter((e, i) => i !== widgetNumber));
    };

    if (!width || !layout) return;

    return (
        <GridLayout
            className="layout"
            layout={layout}
            onLayoutChange={updateLayout}
            cols={cols}
            width={layoutWidth}
            style={{ minHeight: "100vh", minWidth: "100vw" }}
            rowHeight={GRID_SIZE_PX}
            measureBeforeMount
            draggableHandle=".drag-handle"
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragStop={onDragStop}
            onResizeStart={onResizeStart}
            onResize={onResize}
            onResizeStop={onResizeStop}
            onDrop={onDrop}
            isDroppable={true}
            droppingItem={droppingItem}
        >
            {widgets.map((widget: WidgetData, i) => {
                const WidgetComponent = getComponent(widget);

                return (
                    <Flex key={i}>
                        <ActionIcon
                            pos="absolute"
                            right={2}
                            top={8}
                            style={{ zIndex: 100 }}
                            variant="transparent"
                            c="var(--background-color-2)"
                            onClick={(event) => {
                                event.stopPropagation();
                                onDelete(i);
                            }}
                        >
                            <IconX size={18} />
                        </ActionIcon>
                        <WidgetComponent
                            className="drag-handle"
                            data={widget.data}
                            updateData={(data) => updateWidgetData(i, data)}
                            style={{ cursor: "pointer", backgroundColor: selected === `${i}` ? "var(--background-color-6)" : "" }}
                        />
                    </Flex>
                );
            })}
        </GridLayout>
    );
}

export default WidgetLayout;
