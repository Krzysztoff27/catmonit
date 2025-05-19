import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import { WidgetProvider } from "../../../contexts/WidgetContext/WidgetContext";
import { dummies } from "../../../pages/Editor/dummies";
import { CornerManagerProvider } from "../../../contexts/CornerManagerContext/CornerManagerContext";

const EditorTemplate = (): React.JSX.Element => {
    return (
        <CornerManagerProvider>
            <WidgetProvider initialData={dummies}>
                <AppShell>
                    <AppShell.Main>
                        <Outlet />
                    </AppShell.Main>
                </AppShell>
            </WidgetProvider>
        </CornerManagerProvider>
    );
};

export default EditorTemplate;
