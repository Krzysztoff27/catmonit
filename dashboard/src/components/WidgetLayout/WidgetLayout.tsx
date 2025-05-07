import { Flex } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import GridLayout from "react-grid-layout";
import { WidgetData, WidgetLayoutProps } from "../../types/widget.types";
import WIDGETS_CONFIG, { GRID_SIZE_PX } from "../../config/widgets.config";

function WidgetLayout({ widgets }: WidgetLayoutProps) {
    const { width } = useViewportSize();

    if (!width) return;

    return (
        <GridLayout
            className="layout"
            cols={Math.floor(width / GRID_SIZE_PX)}
            rowHeight={GRID_SIZE_PX}
            width={width}
            measureBeforeMount
        >
            {widgets.map((widget: WidgetData, i) => {
                const config = WIDGETS_CONFIG[widget.type];
                const WidgetComponent = config.component;

                return (
                    <Flex
                        key={i}
                        data-grid={{ ...widget.rect, ...config.limits }}
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
