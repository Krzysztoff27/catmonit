import { useMantineColorScheme, Button, Flex } from "@mantine/core";
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

    return (
        <Flex
            flex={1}
            h="100vh"
        >
            <Button onClick={() => setColorScheme("light")}>Light</Button>
            <Button onClick={() => setColorScheme("dark")}>Dark</Button>
            <WidgetLayout
                setWidgets={setWidgets}
                widgets={widgets}
            />
        </Flex>
    );
}

export default Main;
