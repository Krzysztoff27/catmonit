import DeviceDisksWidget from "../../components/DeviceDisksWidgets/DeviceDisksWidget";
import { useMantineColorScheme, Button } from "@mantine/core";

function Main() {
    const { setColorScheme, clearColorScheme } = useMantineColorScheme();

    return (
        <>
            <DeviceDisksWidget device={{ hostname: "Tux", ip: "10.10.100.1", uuid: "a" }} />
            <Button onClick={() => setColorScheme("light")}>Light</Button>
            <Button onClick={() => setColorScheme("dark")}>Dark</Button>
        </>
    );
}

export default Main;
