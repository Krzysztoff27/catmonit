import { Stack, Button, Group, Text } from "@mantine/core";
// import { Alert } from "../../../types/api.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";
import { WidgetPropertiesContentProps } from "../../../types/components.types";
import DataSourceMultiselect from "../../interactive/input/DataSourceMultiselect/DataSourceMultiselect";

interface AlertDrawerProps {
    // hiddenAlerts: Record<string, Alert>;
    onRestore: (id: number) => void;
}
//@TODO store in cookies - useAuth
const AlertDrawer = ({ index }: WidgetPropertiesContentProps): React.JSX.Element => {
    // const AlertDrawer = ({ hiddenAlerts, onRestore }: AlertDrawerProps) => {
    //   const hiddenAlertsArr = Object.values(hiddenAlerts);
    const { getWidget } = useWidgets();
    const widget = getWidget(index);
    return (
        <Stack>
            <DataSourceMultiselect
                index={index}
                widget={widget}
            />
            {/* {hiddenAlertsArr.length === 0 && <Text>No hidden alerts</Text>}

      {hiddenAlertsArr.map((alert) => (
        // position="apart"
        <Group key={alert.id} gap="sm" p="xs" style={{ borderBottom: "1px solid #ddd" }}> 
          <Text size="sm" style={{ flex: 1 }}>
            {alert.message}
          </Text>
          <Button size="xs" onClick={() => onRestore(alert.id)}>
            Restore
          </Button>
        </Group>
      ))} */}
        </Stack>
    );
};

export default AlertDrawer;
