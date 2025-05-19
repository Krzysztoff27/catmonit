import { Stack } from "@mantine/core";

import classes from "./AlertDrawer.module.css";
import DataSourceMultiselect from "../../interactive/input/DataSourceMultiselect/DataSourceMultiselect";
import { WidgetPropertiesContentProps } from "../../../types/components.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";

const AlertDrawer = ({ index }: WidgetPropertiesContentProps): React.JSX.Element => {
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
