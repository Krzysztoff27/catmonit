import { ActionIcon, Flex } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import { isEmpty } from "lodash";
import GridLayout from "react-grid-layout";
import WIDGETS_CONFIG, { GRID_SIZE_PX } from "../../../config/widgets.config";
import { WidgetData } from "../../../types/api.types";
import { WidgetLayoutProps } from "../../../types/components.types";
import { Layout, LayoutItem } from "../../../types/reactGridLayout.types";

function WidgetBoard({
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
    const { width, ref } = useElementSize();
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
    if (!layout) return;

    const updateLayout = (newLayout: Layout) => {
        if (isEmpty(newLayout)) return;
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

    const updateWidgetData = (widgetNumber: number, newData: WidgetData) => {
        setWidgets((prev: WidgetData[]) => {
            prev[widgetNumber].data = newData;
            return prev;
        });
    };

    const onDelete = (widgetNumber) => {
        setWidgets((prev: WidgetData[]) => prev.filter((e, i) => i !== widgetNumber));
    };

    return (
        <GridLayout
            className="layout"
            onLayoutChange={updateLayout}
            cols={cols}
            width={layoutWidth}
            style={{
                minHeight: "100vh",
                flex: 1,
            }}
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
            innerRef={ref}
        >
            {/* !!! important to have the width check here */}
            {/* it prevents widgets having assigned unexpected positions due to ref being assigned late*/}
            {/* had it been higher, the GridLayout would never expand horizontally*/}
            {width && layout ? (
                widgets.map((widget: WidgetData, i) => {
                    const WidgetComponent = getComponent(widget);
                    return (
                        <Flex
                            key={i}
                            data-grid={layout[i]}
                        >
                            <ActionIcon
                                pos="absolute"
                                right={2}
                                top={8}
                                style={{
                                    zIndex: 100,
                                }}
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
                                style={{
                                    cursor: "pointer",
                                    filter: selected === `${i}` ? "brightness(120%)" : "",
                                }}
                            />
                        </Flex>
                    );
                })
            ) : (
                <div></div>
            )}
        </GridLayout>
    );
}

export default WidgetBoard;
