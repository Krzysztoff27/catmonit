import { ActionIcon, Center, Flex, FlexProps, Paper, PaperProps, Stack, Text, Title } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import classes from "./Widget.module.css";
import { LayoutItem } from "../../../types/reactGridLayout.types";
import { forwardRef, useRef } from "react";
import { WidgetData } from "../../../types/api.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import TimeoutRingProgress from "../../display/TimeoutRingProgress/TimeoutRingProgress";
import { dummies } from "../../../pages/Editor/dummies";
import { safeObjectValues } from "../../../utils/object";

interface WidgetProps extends FlexProps {
    index: number; // if index = -1 then its a ghost component
    widget: WidgetData;
    hideDeleteButton?: boolean;
    "data-grid"?: LayoutItem;
    onDelete?: () => void;
    paperProps?: PaperProps;
}

const Widget = forwardRef<HTMLDivElement, WidgetProps>(
    ({ index, widget, "data-grid": dataGrid, onDelete, children, paperProps, hideDeleteButton = false, ...props }: WidgetProps, ref): React.JSX.Element => {
        const { getWidgetConfig, getWidgetData, getWidgetContent } = useWidgets();
        const WidgetContent = getWidgetContent(widget);
        const config = getWidgetConfig(widget);
        const data = index !== -1 ? getWidgetData(widget) : safeObjectValues(dummies[config?.dataSource ?? ""])[0];
        const showTimestamp = config.isReferingToSingularResource && widget?.settings?.target;

        return (
            <Flex
                data-grid={dataGrid}
                ref={ref}
                // @ts-ignore
                index={index}
                {...props}
            >
                {!hideDeleteButton && (
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
                )}
                <Paper
                    {...paperProps}
                    className={`drag-handle ${classes.paper} ${paperProps?.className ?? ""}`}
                    pb={showTimestamp ? "xl" : "md"}
                    withBorder
                >
                    {config.title && (
                        <Title
                            order={3}
                            className={classes.title}
                            mb="md"
                        >
                            {config.title}
                        </Title>
                    )}
                    {!data && config.dataSource ? (
                        <Stack
                            gap="0"
                            align="center"
                            justify="center"
                            flex="1"
                            h="100%"
                            pb="78px"
                        >
                            <Text size="md">{widget.settings.target ? "No connection" : "No results"}</Text>
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                {widget.settings.target ?? "Automatic assignment"}
                            </Text>
                        </Stack>
                    ) : (
                        WidgetContent && (
                            <WidgetContent
                                index={index}
                                data={data}
                                settings={widget?.settings}
                            />
                        )
                    )}
                    {showTimestamp && (
                        <TimeoutRingProgress
                            timestamp={data?.deviceInfo?.lastUpdated}
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
