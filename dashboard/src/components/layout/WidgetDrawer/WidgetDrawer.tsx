import { Drawer, DrawerProps, Space } from "@mantine/core";
import React from "react";
import { WidgetPropertiesContent, WidgetPropertiesContentProps } from "../../../types/components.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import classes from "./WidgetDrawer.module.css";

interface WidgetDrawerProps extends DrawerProps, WidgetPropertiesContentProps {
    component: WidgetPropertiesContent | null;
}

const WidgetDrawer = ({ component: Component, index, ...props }: WidgetDrawerProps): React.JSX.Element => {
    const { getWidget, getWidgetConfig } = useWidgets();
    const widget = getWidget(index);
    const name = getWidgetConfig(widget).name;

    return (
        <Drawer
            {...props}
            title={name}
            classNames={{ title: classes.title }}
        >
            <Space h="lg" />
        </Drawer>
    );
};

export default WidgetDrawer;
