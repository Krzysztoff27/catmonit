import { useMantineColorScheme, Button } from "@mantine/core";
import WidgetLayout from "../../components/WidgetLayout/WidgetLayout";
import { useState } from "react";

function Main() {
    const { setColorScheme, clearColorScheme } = useMantineColorScheme();
    const [widgets, setWidgets] = useState([
        {
            type: "DEVICE_DISKS",
            rect: { x: 0, y: 0, w: 2, h: 2 },
            data: { hostname: "Tux", ip: "10.10.100.1" },
        },
        {
            type: "DEVICE_DISKS",
            rect: { x: 2, y: 0, w: 2, h: 2 },
            data: { hostname: "Tux", ip: "10.10.100.1" },
        },
    ]);

    console.log(widgets);

    return (
        <>
            <Button onClick={() => setColorScheme("light")}>Light</Button>
            <Button onClick={() => setColorScheme("dark")}>Dark</Button>
            <WidgetLayout
                setWidgets={setWidgets}
                widgets={widgets}
            />
        </>
    );
}

export default Main;
