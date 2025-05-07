import DeviceDisksWidget from "../../components/DeviceDisksWidget/DeviceDisksWidget";
import { useMantineColorScheme, Button } from "@mantine/core";
import WidgetLayout from "../../components/WidgetLayout/WidgetLayout";

function Main() {
    const { setColorScheme, clearColorScheme } = useMantineColorScheme();

    return (
        <>
            <Button onClick={() => setColorScheme("light")}>Light</Button>
            <Button onClick={() => setColorScheme("dark")}>Dark</Button>
            <WidgetLayout
                widgets={[
                    { type: "DEVICE_DISKS", rect: { x: 0, y: 0, w: 2, h: 2 }, data: { hostname: "Tux", ip: "10.10.100.1" } },
                    { type: "DEVICE_DISKS", rect: { x: 2, y: 0, w: 2, h: 2 }, data: { hostname: "Mario", ip: "10.10.100.50" } },
                    { type: "DEVICE_DISKS", rect: { x: 0, y: 2, w: 2, h: 2 }, data: { hostname: "Luigi", ip: "10.10.100.10" } },
                    { type: "DEVICE_DISKS", rect: { x: 0, y: 4, w: 2, h: 2 }, data: { hostname: "Tuxer", ip: "10.10.100.13" } },
                    { type: "DEVICE_DISKS", rect: { x: 2, y: 4, w: 2, h: 2 }, data: { hostname: "Server", ip: "10.10.100.12" } },
                    { type: "DEVICE_DISKS", rect: { x: 2, y: 2, w: 2, h: 2 }, data: { hostname: "Teapot", ip: "10.10.100.100" } },
                ]}
            />
        </>
    );
}

export default Main;
