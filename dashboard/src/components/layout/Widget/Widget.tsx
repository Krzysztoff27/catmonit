import { ActionIcon, Box, Center, Flex, FlexProps, Group, Loader, Paper, PaperProps, Stack, Text, Title } from "@mantine/core";
import { IconInfoCircle, IconInfoCircleFilled, IconX } from "@tabler/icons-react";
import classes from "./Widget.module.css";
import { LayoutItem } from "../../../types/reactGridLayout.types";
import { forwardRef, useEffect, useRef, useState } from "react";
import { WidgetData } from "../../../types/api.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import TimeoutRingProgress from "../../display/TimeoutRingProgress/TimeoutRingProgress";
import { dummies } from "../../../pages/Editor/dummies";
import { safeObjectValues } from "../../../utils/object";
import { isNull } from "lodash";
import WidgetBoard from "../WidgetBoard/WidgetBoard";

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
        const [fallback, setFallback] = useState<React.ReactNode>(
            <Loader
                type="bars"
                size="xs"
                color="var(--mantine-color-text)"
            />
        );

        useEffect(() => {
            setFallback(
                <Loader
                    type="bars"
                    size="xs"
                    color="var(--mantine-color-text)"
                />
            );

            const timeout = setTimeout(() => {
                setFallback(
                    <>
                        <Text size="md">{widget.settings.target ? "No connection" : "No results"}</Text>
                        <Text
                            size="xs"
                            c="dimmed"
                            ta="center"
                        >
                            {widget.settings.target ?? "Automatic assignment"}
                        </Text>
                    </>
                );
            }, 500);

            return () => clearTimeout(timeout);
        }, [widget.settings]);

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
                    withBorder
                >
                    <Stack
                        gap="0"
                        h="100%"
                    >
                        {config.title && (
                            <Title
                                order={3}
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
                                pb="48px"
                            >
                                {fallback}
                            </Stack>
                        ) : (
                            WidgetContent && (
                                <WidgetContent
                                    index={index}
                                    data={data}
                                    settings={widget?.settings ?? {}}
                                />
                            )
                        )}
                        {config.isReferingToSingularResource &&
                            (!isNull(widget.settings?.target) ? (
                                <TimeoutRingProgress
                                    timestamp={data?.deviceInfo?.lastUpdated}
                                    source={config.dataSource}
                                    className={classes.timeout}
                                />
                            ) : (
                                <Group
                                    className={classes.timeout}
                                    gap="2"
                                >
                                    <IconInfoCircle
                                        size={18}
                                        stroke={3}
                                        color="var(--mantine-color-dimmed)"
                                        style={{
                                            transform: "scale(70%)",
                                        }}
                                    />
                                    <Text
                                        size="12px"
                                        c="dimmed"
                                        fw="800"
                                        ff="monospace"
                                    >
                                        Device chosen automatically
                                    </Text>
                                </Group>
                            ))}
                        {
                            // children MUST be here for the resize handle to append FOR SOME REASON???"???????"
                            children
                        }
                    </Stack>
                </Paper>
            </Flex>
        );
    }
);

export default Widget;
