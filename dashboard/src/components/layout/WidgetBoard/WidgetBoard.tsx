import { ActionIcon, Flex } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import GridLayout from "react-grid-layout";
import { GRID_MARGIN_PX, GRID_SIZE_PX } from "../../../config/widgets.config";
import { WidgetData } from "../../../types/api.types";
import { WidgetLayoutProps } from "../../../types/components.types";
import classes from "./WidgetBoard.module.css";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";

function WidgetBoard({ selected, onDragStart, onDrag, onDragStop, onResizeStart, onResize, onResizeStop, onDrop, droppingItem }: WidgetLayoutProps) {
    const { widgets, layout, getWidgetData, deleteWidget, setWidgetRects, getWidgetComponent } = useWidgets();

    const { width, ref } = useElementSize();
    const cols = Math.floor(width / GRID_SIZE_PX);
    const layoutWidth = GRID_SIZE_PX * cols + GRID_MARGIN_PX * (cols + 1);

    if (!layout) return;

    const elements =
        width && layout ? (
            widgets.map((widget: WidgetData, i) => {
                const WidgetComponent = getWidgetComponent(widget);
                return (
                    <Flex
                        key={i}
                        data-grid={layout[i]}
                    >
                        <ActionIcon
                            className={classes.deleteButton}
                            c="var(--background-color-2)"
                            variant="transparent"
                            onClick={(event) => {
                                event.stopPropagation();
                                deleteWidget(i);
                            }}
                        >
                            <IconX size={18} />
                        </ActionIcon>
                        <WidgetComponent
                            className={`drag-handle ${classes.widget} ${selected === `${i}` ? classes.selected : ""}`}
                            data={getWidgetData(widget)}
                            settings={widget.settings}
                        />
                    </Flex>
                );
            })
        ) : (
            <div></div>
        );

    return (
        <GridLayout
            className={`layout ${classes.layout}`}
            onLayoutChange={setWidgetRects}
            cols={cols}
            width={layoutWidth}
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
            margin={[GRID_MARGIN_PX, GRID_MARGIN_PX]}
        >
            {elements}
        </GridLayout>
    );
}

export default WidgetBoard;
