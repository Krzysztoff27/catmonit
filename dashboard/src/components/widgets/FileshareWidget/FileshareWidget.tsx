import { Paper, Progress, Tooltip } from "@mantine/core";
import React from "react";
import classes from "./FileshareWidget.module.css";

function FileshareWidget({ data, settings, className, ...props }) {
    return (
        //what if path is too long
        <Paper
            {...props}
            className={`${className} ${classes.container}`}
            py="lg"
            px="xl"
        >
                <Progress.Root size={15}>
                    <Progress.Section
                        value={10}
                        color="DarkSlateGray"
                    >
                        <Progress.Label>G</Progress.Label>
                    </Progress.Section>
                    <Progress.Section
                        value={35}
                        color="DarkSeaGreen"
                    >
                        <Progress.Label>Aga</Progress.Label>
                    </Progress.Section>
                </Progress.Root>
        </Paper>
    );
}

export default FileshareWidget;
