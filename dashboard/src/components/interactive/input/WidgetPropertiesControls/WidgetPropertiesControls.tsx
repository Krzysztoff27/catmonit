import { Grid, NumberInput, Title } from "@mantine/core";
import React from "react";
import classes from "./WidgetPropertiesControls.module.css";
import { useForm } from "@mantine/form";
import WIDGETS_CONFIG from "../../../../config/widgets.config";

const WidgetPropertiesControls = ({ widget, setWidgetRect }): React.JSX.Element => {
    const form = useForm({
        initialValues: {
            x: widget?.rect?.x ?? 0,
            y: widget?.rect?.y ?? 0,
            w: widget?.rect?.w ?? 0,
            h: widget?.rect?.h ?? 0,
        },
        onValuesChange: (values) => {
            console.log(values);
            setWidgetRect(values);
        },
    });

    if (!widget) return <></>;

    return (
        <form>
            <Title
                order={4}
                mb="md"
            >
                Properties
            </Title>
            <Grid
                columns={4}
                gutter="xs"
                className={classes.grid}
            >
                <Grid.Col span={1}>Width</Grid.Col>
                <Grid.Col span={1}>Height</Grid.Col>
                <Grid.Col span={1}>X position</Grid.Col>
                <Grid.Col span={1}>Y position</Grid.Col>
                <Grid.Col span={1}>
                    <NumberInput
                        min={WIDGETS_CONFIG[widget.type].limits.minW}
                        max={WIDGETS_CONFIG[widget.type].limits.maxW}
                        key={form.key("w")}
                        {...form.getInputProps("w")}
                    />
                </Grid.Col>
                <Grid.Col span={1}>
                    <NumberInput
                        min={WIDGETS_CONFIG[widget.type].limits.minH}
                        max={WIDGETS_CONFIG[widget.type].limits.maxH}
                        key={form.key("h")}
                        {...form.getInputProps("h")}
                    />
                </Grid.Col>
                <Grid.Col span={1}>
                    <NumberInput
                        min={1}
                        max={100}
                        key={form.key("x")}
                        {...form.getInputProps("x")}
                    />
                </Grid.Col>
                <Grid.Col span={1}>
                    <NumberInput
                        min={1}
                        max={100}
                        key={form.key("y")}
                        {...form.getInputProps("y")}
                    />
                </Grid.Col>
            </Grid>
        </form>
    );
};

export default WidgetPropertiesControls;
