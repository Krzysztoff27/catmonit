import { Stack, Button, Group, Text, Title } from "@mantine/core";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { WidgetPropertiesContentProps } from "../../../types/components.types";
import { useCookies } from "react-cookie";
import { useData } from "../../../contexts/DataContext/DataContext";
import { Alert, ErrorInfo, WarningInfo } from "../../../types/api.types";
import { safeObjectValues } from "../../../utils/object";
import DataSourceMultiselect from "../../interactive/input/DataSourceMultiselect/DataSourceMultiselect";
import DeviceTitle from "../../display/DeviceTitle/DeviceTitle";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";

const AlertDrawer = ({ index }: WidgetPropertiesContentProps): React.JSX.Element => {
    const { getWidget, getData } = useWidgets();
    const { websockets } = useData();
    const [cookies, setCookies] = useCookies(["hiddenAlerts"]);
    const widget = getWidget(index);
    const sources = widget?.settings?.sources ?? [];

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

    const hiddenAlerts = allAlerts.filter((alert) =>
        cookies.hiddenAlerts?.includes(alert.id)
    );

    const handleRestore = (id: string) => {
        const updated = cookies.hiddenAlerts?.filter((alertId: string) => alertId !== id);
        setCookies("hiddenAlerts", updated ?? []);
    };

    return (
        <Stack>
            <DataSourceMultiselect index={index} widget={widget} />
            {hiddenAlerts.length === 0 && <Text>No hidden alerts</Text>}
            <Title order={4}>Hidden alerts: </Title>
            {hiddenAlerts.map((alert) => (
                <Group key={alert.id} gap="sm" p="xs" style={{ borderBottom: "1px solid #ddd" }}>
                    <DeviceTitleOneLine data={alert} style={{ overflow: "hidden"}}/>
                    <Text size="sm" style={{ flex: 1 }}>
                        {alert.message}
                    </Text>
                    <Button size="xs" onClick={() => handleRestore(alert.id)} color="indigo.6">
                        Restore
                    </Button>
                </Group>
            ))}
        </Stack>
    );
};

export default AlertDrawer;
