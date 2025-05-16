import { Drawer, DrawerProps, Space, Title } from "@mantine/core";
import React from "react";
import { DrawerComponent, DrawerComponentProps } from "../../../types/components.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import WIDGETS_CONFIG from "../../../config/widgets.config";
import classes from "./WidgetDrawer.module.css";

interface WidgetDrawerProps extends DrawerProps, DrawerComponentProps {
    component: DrawerComponent | null;
}

const WidgetDrawer = ({ component: Component, index, ...props }: WidgetDrawerProps): React.JSX.Element => {
    const { getWidget } = useWidgets();
    const widget = getWidget(index);
    const name = WIDGETS_CONFIG?.[widget?.type]?.name;

    return (
        <Drawer
            {...props}
            title={name}
            classNames={{ title: classes.title }}
        >
            <Space h="lg" />
            {Component && <Component index={index} />}
        </Drawer>
    );
};

export default WidgetDrawer;
