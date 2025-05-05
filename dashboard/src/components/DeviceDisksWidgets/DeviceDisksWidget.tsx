import { Paper, Stack } from "@mantine/core";
import { useState } from "react";

interface Disk {
    path: string;
    storageLimit: number;
    storageCurrent: number;
}

function DeviceDisksWidget() {
    const [disksData, setDisksData] = useState<Disk[]>([]);

    return (
        <Paper
            h="300px"
            w="200px"
            withBorder
        ></Paper>
    );
}

export default DeviceDisksWidget;
