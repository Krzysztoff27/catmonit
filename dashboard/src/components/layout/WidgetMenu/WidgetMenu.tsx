import { Box, Center, Group, Paper, PaperProps, Tooltip } from "@mantine/core";
import { useRef, useState } from "react";
import classes from "./WidgetMenu.module.css";

import { capitalize } from "lodash";
import WIDGETS_CONFIG, { GRID_SIZE_PX } from "../../../config/widgets.config";
import { safeObjectEntries } from "../../../utils/object";

interface WidgetMenuProps extends PaperProps {
    currentDropType: string | null;
    setCurrentDropType: (type: string) => void;
}

const DRAG_OFFSET = 24;

const WidgetMenu = ({ currentDropType, setCurrentDropType, className, ...props }: WidgetMenuProps): React.JSX.Element => {
    const ref = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);

    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

    const updateGhostPosition = (x, y) => {
        ref.current!.style.transform = `translate(${x - DRAG_OFFSET}px, ${y - DRAG_OFFSET}px)`;
    };

    const currentConfiguration = currentDropType ? WIDGETS_CONFIG[currentDropType] : undefined;

    const onDragStart = (e) => {
        setCurrentDropType(e.target.id);
        e.dataTransfer.setData("text/plain", e.target.id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setDragImage(img, 0, 0);
        setIsDragging(true);
    };

    const onDrag = (e) => updateGhostPosition(e.clientX, e.clientY);

    const onDragEnd = (e) => setIsDragging(false);

    return (
        <>
            {currentConfiguration && (
                <currentConfiguration.component
                    data={{}}
                    updateData={() => {}}
                    ref={ref}
                    style={{
                        width: currentConfiguration.limits.minW * GRID_SIZE_PX,
                        height: currentConfiguration.limits.minH * GRID_SIZE_PX,
                        visibility: isDragging ? "visible" : "hidden",
                    }}
                    className={classes.ghost}
                />
            )}
            <Box className={classes.positioner}>
                <Paper
                    {...props}
                    className={`${className} ${classes.container}`}
                    withBorder
                    shadow="md"
                >
                    <Group gap="0">
                        {safeObjectEntries(WIDGETS_CONFIG).map(([type, config], i) => (
                            <Tooltip
                                key={i}
                                label={capitalize(config.name)}
                            >
                                <Center
                                    id={type}
                                    draggable={true}
                                    unselectable="on"
                                    onDragStart={onDragStart}
                                    onDrag={onDrag}
                                    onDragEnd={onDragEnd}
                                    className={`droppable-element ${classes.droppable}`}
                                >
                                    <config.icon />
                                </Center>
                            </Tooltip>
                        ))}
                    </Group>
                </Paper>
            </Box>
        </>
    );
};

export default WidgetMenu;
