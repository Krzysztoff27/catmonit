import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { WidgetProvider } from "../../../contexts/WidgetContext/WidgetContext";
import { CornerManagerProvider } from "../../../contexts/CornerManagerContext/CornerManagerContext";
import { LayoutProvider } from "../../../contexts/LayoutContext/LayoutContext";
import { DataProvider } from "../../../contexts/DataContext/DataContext";

const EditorTemplate = (): React.JSX.Element => {
    return (
        <CornerManagerProvider>
            <DataProvider>
                <LayoutProvider>
                    <WidgetProvider>
                        <AppShell>
                            <AppShell.Main>
                                <Outlet />
                            </AppShell.Main>
                        </AppShell>
                    </WidgetProvider>
                </LayoutProvider>
            </DataProvider>
        </CornerManagerProvider>
    );
};

export default EditorTemplate;
