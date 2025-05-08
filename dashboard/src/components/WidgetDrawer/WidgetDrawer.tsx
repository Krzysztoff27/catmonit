import { Drawer, DrawerProps } from "@mantine/core";
import React from "react";

const WidgetDrawer = ({ children, ...props }: DrawerProps): React.JSX.Element => {
    return <Drawer {...props}>{children}</Drawer>;
};

export default WidgetDrawer;
