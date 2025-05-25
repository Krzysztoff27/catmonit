import { useMemo } from "react";
import CornerFloater from "../../wrappers/CornerFloater/CornerFloater";
import { ActionIcon, ScrollArea, Stack, Title } from "@mantine/core";
import classes from "./WidgetProperties.module.css";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { IconX } from "@tabler/icons-react";
import { useViewportSize } from "@mantine/hooks";

const WidgetProperties = ({}): React.JSX.Element => {
    const { height } = useViewportSize();
    const { getWidget, selected, setSelected, getWidgetPropertiesContent } = useWidgets();

    const close = () => setSelected(null);

    const Content = useMemo(() => {
        if (selected === null) return undefined;
        return getWidgetPropertiesContent(getWidget(selected));
    }, [selected]);

    return (
        <CornerFloater
            id="widgetProperties"
            width={400}
            height={height / 2 - 40}
            hide={selected === null}
        >
            <ActionIcon
                className={classes.deleteButton}
                c="var(--background-color-2)"
                variant="transparent"
                onClick={(event) => {
                    event.stopPropagation();
                    close();
                }}
            >
                <IconX size={18} />
            </ActionIcon>
            <Stack
                p="md"
                h="100%"
            >
                <Title order={3}>Widget Properties</Title>
                <ScrollArea
                    h="100%"
                    scrollbarSize="0.625rem"
                    offsetScrollbars
                >
                    <Stack h="100%">{Content && <Content index={selected!} />}</Stack>
                </ScrollArea>
            </Stack>
        </CornerFloater>
    );
};

export default WidgetProperties;
