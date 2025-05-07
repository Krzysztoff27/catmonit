import { Flex } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import GridLayout from "react-grid-layout";
import { GRID_SIZE, WIDGET_CONFIG, WIDGETS } from "./WidgetLayout.config";
import { WidgetData, WidgetLayoutProps } from "../../types/widget.types";

function WidgetLayout({ widgets }: WidgetLayoutProps) {
    const { width } = useViewportSize();

    if (!width) return;

    return (
        <GridLayout
            className="layout"
            cols={Math.floor(width / GRID_SIZE)}
            rowHeight={GRID_SIZE}
            width={width}
            measureBeforeMount
            margin={[0, 0]}
        >
            {widgets.map((widget: WidgetData, i) => {
                const WidgetComponent = WIDGETS[widget.type];
                return (
                    <Flex
                        key={i}
                        data-grid={{ ...widget.rect, ...WIDGET_CONFIG[widget.type] }}
                        p="xs"
                    >
                        <WidgetComponent
                            data={widget.data}
                            style={{ cursor: "pointer" }}
                        />
                    </Flex>
                );
            })}
        </GridLayout>
    );
}

export default WidgetLayout;
