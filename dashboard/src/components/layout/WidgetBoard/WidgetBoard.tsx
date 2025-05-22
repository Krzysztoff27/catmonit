import { useElementSize } from "@mantine/hooks";
import GridLayout from "react-grid-layout";
import { GRID_MARGIN_PX, GRID_SIZE_PX } from "../../../config/widgets.config";
import { WidgetData } from "../../../types/api.types";
import { WidgetLayoutProps } from "../../../types/components.types";
import classes from "./WidgetBoard.module.css";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import Widget from "../Widget/Widget";
import { Layout, LayoutItem } from "../../../types/reactGridLayout.types";
import { useEffect } from "react";

function WidgetBoard({ editable = true, onDrop, droppingItem }: WidgetLayoutProps) {
    const { widgets, layout, deleteWidget, setWidgetRects, setSelected, selected } = useWidgets();

    const { width, ref } = useElementSize();
    const cols = Math.floor(width / GRID_SIZE_PX);
    const layoutWidth = GRID_SIZE_PX * cols + GRID_MARGIN_PX * (cols + 1);

    if (!layout) return;

    let clicked = false;
    const onDragStart = () => {
        clicked = true;
        setTimeout(() => (clicked = false), 500); // verify its an a singular, short click
    };

    const onDragStop = (_: Layout, before: LayoutItem, after: LayoutItem) => {
        if (!clicked || JSON.stringify(before) !== JSON.stringify(after)) return;
        setSelected(parseInt(after.i));
    };

    const onMouseDown = (e) => {
        if ((e.target as HTMLElement).closest(".layout")) setSelected(null);
    };

    useEffect(() => {
        const element = ref.current;
        if (element) {
            element.addEventListener("mousedown", onMouseDown);
        }

        return () => {
            if (element) {
                element.removeEventListener("mousedown", onMouseDown);
            }
        };
    }, []);

    const elements =
        width && layout ? (
            widgets.map((widget: WidgetData, i) => (
                <Widget
                    key={i}
                    index={i}
                    widget={widget}
                    data-grid={layout[i]}
                    onDelete={() => deleteWidget(i)}
                    className={`${classes.widget} ${selected === i ? classes.selected : ""}`}
                />
            ))
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
            draggableCancel=".no-drag, button, input, .mantine-ActionIcon-root"
            onDragStart={onDragStart}
            onDragStop={onDragStop}
            onDrop={onDrop}
            isDraggable={editable}
            isDroppable={editable}
            isResizable={editable}
            droppingItem={droppingItem}
            innerRef={ref}
            margin={[GRID_MARGIN_PX, GRID_MARGIN_PX]}
        >
            {elements}
        </GridLayout>
    );
}

export default WidgetBoard;
