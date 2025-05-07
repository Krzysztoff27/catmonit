import { Flex } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import GridLayout from "react-grid-layout";
import WIDGETS_CONFIG, { GRID_SIZE_PX } from "../../config/widgets.config";
import { WidgetData } from "../../types/api.types";
import { WidgetLayoutProps } from "../../types/components.types";
import { useState } from "react";

function WidgetLayout({ widgets, onUpdate }: WidgetLayoutProps) {
    const { width } = useViewportSize();

    const getLimits = (widget: WidgetData) => WIDGETS_CONFIG[widget.type].limits;
    const getComponent = (widget: WidgetData) => WIDGETS_CONFIG[widget.type].component;
    const getDataFromWidgets = () => widgets.map(widget => widget.data);
    const getLayoutFromWidgets = () =>
        widgets.map((widget: WidgetData, i) => ({
            i: `${i}`,
            ...widget.rect,
            ...getLimits(widget),
        }));

    const widgetTypes = widgets.map(widget => widget.type);
    const [widgetData, setWidgetData] = useState(getDataFromWidgets());
    const [layout, setLayout] = useState(getLayoutFromWidgets());

    if (!width) return;

    const getWidgetsFromLayout = (layout_): WidgetData[] =>
        layout_.map(
            ({ i, ...rect }) =>
                ({
                    data: widgetData[i],
                    type: widgetTypes[i],
                    rect: rect,
                } as WidgetData)
        );

    const onLayoutChange = newLayout => {
        setLayout(newLayout);
        onUpdate(getWidgetsFromLayout(newLayout));
    };

    const updateWidgetData = (widgetNumber, newData) => {
        setWidgetData(prev => {
            prev[widgetNumber] = newData;
            return prev;
        });
        onUpdate(getWidgetsFromLayout(layout));
    };

    return (
        <GridLayout
            className="layout"
            layout={layout}
            cols={Math.floor(width / GRID_SIZE_PX)}
            rowHeight={GRID_SIZE_PX}
            width={width}
            measureBeforeMount
            onLayoutChange={onLayoutChange}
        >
            {widgets.map((widget: WidgetData, i) => {
                const WidgetComponent = getComponent(widget);

                return (
                    <Flex key={i}>
                        <WidgetComponent
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
