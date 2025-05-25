import { Box } from "@mantine/core";
import { WidgetContentProps } from "../../../types/components.types";
import classes from "./SpacingWidget.module.css";
function SpacingWidget({ data, settings, ...props }: WidgetContentProps) {
    return (
        <Box
            className={classes.container}
            {...props}
        >
        </Box>
    );
}

export default SpacingWidget;
