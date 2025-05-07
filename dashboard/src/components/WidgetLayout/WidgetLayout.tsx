import { ActionIcon, Flex } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import GridLayout from "react-grid-layout";
import WIDGETS_CONFIG, { GRID_SIZE_PX } from "../../config/widgets.config";
import { WidgetData } from "../../types/api.types";
import { WidgetLayoutProps } from "../../types/components.types";
import { IconX } from "@tabler/icons-react";

function WidgetLayout({ widgets, setWidgets }: WidgetLayoutProps) {
    const { width } = useViewportSize();

    const getLimits = (widget: WidgetData) => WIDGETS_CONFIG[widget.type].limits;
    const getComponent = (widget: WidgetData) => WIDGETS_CONFIG[widget.type].component;

    const widgetTypes = widgets.map(widget => widget.type);
    const layout = widgets.map((widget: WidgetData, i) => ({
        i: `${i}`,
        ...widget.rect,
        ...getLimits(widget),
    }));

    const updateLayout = newLayout => {
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

    const onDelete = widgetNumber => {
        setWidgets((prev: WidgetData[]) => prev.filter((e, i) => i !== widgetNumber));
    };

    if (!width) return;

    return (
        <GridLayout
            className="layout"
            layout={layout}
            cols={Math.floor(width / GRID_SIZE_PX)}
            rowHeight={GRID_SIZE_PX}
            width={width}
            measureBeforeMount
            onLayoutChange={updateLayout}
            draggableHandle=".drag-handle"
        >
            {widgets.map((widget: WidgetData, i) => {
                const WidgetComponent = getComponent(widget);

                return (
                    <Flex key={i}>
                        <ActionIcon
                            pos="absolute"
                            right={0}
                            variant="transparent"
                            c="var(--background-color-2)"
                            onClick={event => {
                                event.stopPropagation();
                                console.log("a");
                                onDelete(i);
                            }}
                        >
                            <IconX size={18} />
                        </ActionIcon>
                        <WidgetComponent
                            className="drag-handle"
                            data={widget.data}
                            updateData={data => updateWidgetData(i, data)}
                            style={{ cursor: "pointer" }}
                        />
                    </Flex>
                );
            })}
        </GridLayout>
    );
}

export default WidgetLayout;
