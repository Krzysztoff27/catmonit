import { WidgetProvider } from "../../contexts/WidgetContext/WidgetContext";
import Dashboard from "../../components/layout/Dashboard/Dashboard";
import { data } from "./dummies";

function Editor() {
    return (
        <WidgetProvider initialData={data}>
            <Dashboard />
        </WidgetProvider>
    );
}

export default Editor;
