import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import WidgetMenu from "../WidgetMenu/WidgetMenu";

const DashboardLayout = (): React.JSX.Element => {
    const [navbarExpanded, { toggle }] = useDisclosure(true);

    return (
        <AppShell
            navbar={{ width: navbarExpanded ? 240 : 74, breakpoint: "sm" }}
            withBorder={false}
        >
            <AppShell.Navbar bg="transparent">
                <Navbar
                    expanded={navbarExpanded}
                    toggle={toggle}
                />
            </AppShell.Navbar>
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
};

export default DashboardLayout;
