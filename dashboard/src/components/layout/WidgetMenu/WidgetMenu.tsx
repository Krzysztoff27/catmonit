import { Box, Center, Group, Paper, PaperProps, Portal, ScrollArea, Stack, Tooltip } from "@mantine/core";
import { useRef, useState } from "react";
import classes from "./WidgetMenu.module.css";
import { capitalize } from "lodash";
import WIDGETS_CONFIG, { GRID_MARGIN_PX, GRID_SIZE_PX } from "../../../config/widgets.config";
import { safeObjectEntries } from "../../../utils/object";
import Widget from "../Widget/Widget";

interface WidgetMenuProps extends PaperProps {
    isDragging: boolean;
    setIsDragging: (prev: boolean) => void;
    currentDropType: string | null;
    setCurrentDropType: (type: string) => void;
}

const DRAG_OFFSET = 12;

const WidgetMenu = ({ isDragging, setIsDragging, currentDropType, setCurrentDropType, className, ...props }: WidgetMenuProps): React.JSX.Element => {
    const ref = useRef<HTMLDivElement>(null);
    const currentConfiguration = currentDropType ? WIDGETS_CONFIG[currentDropType] : undefined;
    const { minW, minH } = currentConfiguration?.limits || { minW: 0, minH: 0 };

    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

    const updateGhostPosition = (x: number, y: number) => {
        if (!ref.current) return;
        ref.current!.style.transform = `translate(${x - DRAG_OFFSET}px, ${y - DRAG_OFFSET}px)`;
    };

    const onDragStart = (e) => {
        setCurrentDropType(e.target.id);
        e.dataTransfer.setData("text/plain", e.target.id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setDragImage(img, 0, 0);
        updateGhostPosition(e.clientX, e.clientY);
        setIsDragging(true);
    };

    const onDrag = (e) => {
        updateGhostPosition(e.clientX, e.clientY);
    };

    const onDragEnd = (e) => {
        setIsDragging(false);
    };

    return (
        <>
            {currentConfiguration && (
                <Portal>
                    <Widget
                        index={-1}
                        // @ts-ignore
                        widget={{ type: currentDropType!, settings: currentConfiguration.initialSettings }}
                        className={classes.ghost}
                        style={{
                            width: minW * GRID_SIZE_PX + (minW - 1) * GRID_MARGIN_PX,
                            height: minH * GRID_SIZE_PX + (minH - 1) * GRID_MARGIN_PX,
                            visibility: isDragging ? "visible" : "hidden",
                        }}
                        ref={ref}
                    />
                </Portal>
            )}

            <ScrollArea scrollbarSize="0.625rem">
                <Stack className={classes.container}>
                    {safeObjectEntries(WIDGETS_CONFIG).map(([type, config], i) => (
                        <img
                            key={i}
                            id={type}
                            draggable={true}
                            unselectable="on"
                            onDragStart={onDragStart}
                            onDrag={onDrag}
                            onDragEnd={onDragEnd}
                            className={`droppable-element ${classes.droppable}`}
                            src={config.image}
                        />
                    ))}
                </Stack>
            </ScrollArea>
        </>
    );
};

export default WidgetMenu;
