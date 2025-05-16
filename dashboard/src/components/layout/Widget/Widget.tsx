import { ActionIcon, Flex, FlexProps, Paper, PaperProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import classes from "./Widget.module.css";
import { LayoutItem } from "../../../types/reactGridLayout.types";
import { forwardRef } from "react";
import { WidgetData } from "../../../types/api.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import TimeoutRingProgress from "../../display/TimeoutRingProgress/TimeoutRingProgress";
import DUMMIES from "../WidgetMenu/dummies";

interface WidgetProps extends FlexProps {
    index: number; // if index = -1 then its a ghost component
    widget: WidgetData;
    "data-grid"?: LayoutItem;
    onDelete?: () => void;
    paperProps?: PaperProps;
}

const Widget = forwardRef<HTMLDivElement, WidgetProps>(
    ({ index, widget, "data-grid": dataGrid, onDelete, children, paperProps, ...props }: WidgetProps, ref): React.JSX.Element => {
        const { getWidgetConfig, getWidgetData, getWidgetContent } = useWidgets();
        const WidgetContent = getWidgetContent(widget);
        const config = getWidgetConfig(widget);
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
                    <WidgetContent
                        index={index}
                        data={index !== -1 ? getWidgetData(widget) : DUMMIES[widget.type]}
                        settings={widget?.settings}
                    />
                    {config.isReferingToSingularResource && !widget?.settings?.automatic && (
                        <TimeoutRingProgress
                            timestamp={new Date().toISOString()}
                            className={classes.timeout}
                        />
                    )}
                    {
                        // children MUST be here for the resize handle to append FOR SOME REASON???"???????"
                        children
                    }
                </Paper>
            </Flex>
        );
    }
);

export default Widget;
