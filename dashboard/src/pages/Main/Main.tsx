import DeviceDisksWidget from "../../components/DeviceDisksWidget/DeviceDisksWidget";
import { useMantineColorScheme, Button } from "@mantine/core";
import WidgetLayout from "../../components/WidgetLayout/WidgetLayout";
import config from "../../config/widgets.config";

function Main() {
    const { setColorScheme, clearColorScheme } = useMantineColorScheme();

    return (
        <>
            <Button onClick={() => setColorScheme("light")}>Light</Button>
            <Button onClick={() => setColorScheme("dark")}>Dark</Button>
            <WidgetLayout
                widgets={[
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
                ]}
            />
        </>
    );
}

export default Main;
