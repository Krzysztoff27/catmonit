import { Stack, Button, Group, Text, Title } from "@mantine/core";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { WidgetPropertiesContentProps } from "../../../types/components.types";
import { useCookies } from "react-cookie";
import { useData } from "../../../contexts/DataContext/DataContext";
import DataSourceMultiselect from "../../interactive/input/DataSourceMultiselect/DataSourceMultiselect";
import DeviceTitleOneLine from "../../display/DeviceTitle/DeviceTitleOneLine";
import { getAllAlertData } from "../../widgets/AlertWidget/alertWidgetUtils";

const AlertDrawer = ({ index }: WidgetPropertiesContentProps): React.JSX.Element => {
    const { getWidget, getData } = useWidgets();
    const { websockets } = useData();
    const [cookies, setCookies] = useCookies(["hiddenAlerts"]);
    const widget = getWidget(index);

    const { alerts } = getAllAlertData(widget.settings, cookies.hiddenAlerts ?? [], getData);
    const hiddenAlerts = alerts.filter((alert) => cookies.hiddenAlerts?.includes(alert.id));

    const handleRestore = (id: string) => {
        const updated = cookies.hiddenAlerts?.filter((alertId: string) => alertId !== id);
        setCookies("hiddenAlerts", updated ?? []);
    };

    return (
        <Stack>
            <DataSourceMultiselect
                index={index}
                widget={widget}
            />
            <Title order={4}>Hidden alerts: </Title>
            {hiddenAlerts.length === 0 && (
                <Text
                    fz="sm"
                    c="dimmed"
                    mt="-12px"
                >
                    No hidden alerts
                </Text>
            )}
            {hiddenAlerts.map((alert, i) => (
                <Group
                    key={i}
                    gap="sm"
                    p="xs"
                    style={{ borderBottom: "1px solid var(--background-color-4)" }}
                    align="start"
                >
                    <DeviceTitleOneLine
                        data={alert}
                        style={{ overflow: "hidden" }}
                        w="100%"
                    />
                    <Text
                        size="sm"
                        style={{ flex: 1 }}
                    >
                        {alert.message}
                    </Text>
                    <Button
                        size="xs"
                        onClick={() => handleRestore(alert.id)}
                        variant="white"
                        c="black"
                    >
                        Restore
                    </Button>
                </Group>
            ))}
        </Stack>
    );
};

export default AlertDrawer;
