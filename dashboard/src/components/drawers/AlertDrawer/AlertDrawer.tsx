import { Stack } from "@mantine/core";
import React from "react";
import classes from "./AlertDrawer.module.css";
import DataSourceMultiselect from "../../interactive/input/DataSourceMultiselect/DataSourceMultiselect";
import { DrawerContentProps } from "../../../types/components.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";

const AlertDrawer = ({ index }: DrawerContentProps): React.JSX.Element => {
    const { getWidget } = useWidgets();
    const widget = getWidget(index);

    return (
        <Stack className={classes.container}>
            <DataSourceMultiselect
                index={index}
                widget={widget}
            />
        </Stack>
    );
};

export default AlertDrawer;
