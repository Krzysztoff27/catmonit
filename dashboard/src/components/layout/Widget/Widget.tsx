import { ActionIcon, Flex, FlexProps, Paper, PaperProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import classes from "./Widget.module.css";
import { LayoutItem } from "../../../types/reactGridLayout.types";
import { forwardRef } from "react";

interface WidgetProps extends FlexProps {
    "data-grid"?: LayoutItem;
    onDelete?: () => void;
    paperProps?: PaperProps;
}

const Widget = forwardRef<HTMLDivElement, WidgetProps>(
    ({ "data-grid": dataGrid, onDelete, children, paperProps, ...props }: WidgetProps, ref): React.JSX.Element => {
        return (
            <Flex
                data-grid={dataGrid}
                ref={ref}
                {...props}
            >
                <ActionIcon
                    className={classes.deleteButton}
                    c="var(--background-color-2)"
                    variant="transparent"
                    onClick={(event) => {
                        event.stopPropagation();
                        onDelete?.();
                    }}
                >
                    <IconX size={18} />
                </ActionIcon>
                <Paper
                    {...paperProps}
                    className={`drag-handle ${classes.paper} ${paperProps?.className ?? ""}`}
                    withBorder
                >
                    {children}
                </Paper>
            </Flex>
        );
    }
);

export default Widget;
