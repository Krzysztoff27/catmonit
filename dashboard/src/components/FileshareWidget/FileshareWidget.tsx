import { Paper, Progress, Tooltip } from "@mantine/core";
import React from "react";

function FileshareWidget() {
    return (
        //what if username is too long
        <Paper bg="var(--background-color-3)">
            <Progress.Root size={20}>
                <Progress.Section
                    value={10}
                    color="cyan"
                >
                    <Progress.Label>Geeko</Progress.Label>
                </Progress.Section>
                <Progress.Section
                    value={35}
                    color="pink"
                >
                    <Progress.Label>Aga</Progress.Label>
                </Progress.Section>
            </Progress.Root>
        </Paper>
    );
}

export default FileshareWidget;
