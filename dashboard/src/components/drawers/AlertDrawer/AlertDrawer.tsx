import { Stack, Button, Group, Text } from "@mantine/core";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { WidgetPropertiesContentProps } from "../../../types/components.types";
import { useCookies } from "react-cookie";
import { useData } from "../../../contexts/DataContext/DataContext";
import { Alert, ErrorInfo, WarningInfo } from "../../../types/api.types";
import { safeObjectValues } from "../../../utils/object";
import DataSourceMultiselect from "../../interactive/input/DataSourceMultiselect/DataSourceMultiselect";

const AlertDrawer = ({ index }: WidgetPropertiesContentProps): React.JSX.Element => {
    const { getWidget, getData } = useWidgets();
    const { websockets } = useData();
    const [cookies, setCookies] = useCookies(["hiddenAlerts"]);
    const widget = getWidget(index);
    const sources = widget?.settings?.sources ?? [];

    // Step 1: Gather all alerts (like in AlertWidget)
    const combinedAlerts = sources.reduce(
        (prev, source: string) => {
            const data = getData(source);
            return {
                warnings: [...prev.warnings, ...safeObjectValues(data.warnings)],
                errors: [...prev.errors, ...safeObjectValues(data.errors)],
            };
        },
        { warnings: [], errors: [] }
    );

    const getAlertArray = (type: "warnings" | "errors") =>
        combinedAlerts[type].reduce(
            (prev: Alert[], warningInfo: WarningInfo | ErrorInfo) => [
                ...prev,
                ...warningInfo[type].map(
                    (message: string) =>
                        ({
                            message,
                            deviceInfo: warningInfo.deviceInfo,
                            isWarning: type === "warnings",
                            id: `${warningInfo.deviceInfo.uuid}:::${message}`,
                        } as Alert)
                ),
            ],
            []
        );

    const allAlerts = [...getAlertArray("errors"), ...getAlertArray("warnings")];

    // Step 2: Filter by hidden IDs
    const hiddenAlerts = allAlerts.filter((alert) =>
        cookies.hiddenAlerts?.includes(alert.id)
    );

    // Step 3: Restore function
    const handleRestore = (id: string) => {
        const updated = cookies.hiddenAlerts?.filter((alertId: string) => alertId !== id);
        setCookies("hiddenAlerts", updated ?? []);
    };

    return (
        <Stack>
            <DataSourceMultiselect index={index} widget={widget} />
            {hiddenAlerts.length === 0 && <Text>No hidden alerts</Text>}

            {hiddenAlerts.map((alert) => (
                <Group key={alert.id} gap="sm" p="xs" style={{ borderBottom: "1px solid #ddd" }}>
                    <Text size="sm" style={{ flex: 1 }}>
                        {alert.message}
                    </Text>
                    <Button size="xs" onClick={() => handleRestore(alert.id)}>
                        Restore
                    </Button>
                </Group>
            ))}
        </Stack>
    );
};

export default AlertDrawer;
