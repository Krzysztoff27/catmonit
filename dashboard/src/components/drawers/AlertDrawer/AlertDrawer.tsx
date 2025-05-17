import { Select, Switch, Stack, Title } from "@mantine/core";
import { DrawerContentProps } from "../../../types/components.types";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";

function AlertDrawer({ index }: DrawerContentProps) {
  const { getWidget, setWidgetSettings } = useWidgets();
  const widget = getWidget(index);

  const alertType = widget?.settings?.alertType ?? "disk";
  const animationsEnabled = widget?.settings?.animations !== false;

  const onAlertTypeChange = (value: string | null) => {
    if (!value) return;
    setWidgetSettings(index, { ...widget.settings, alertType: value });
  };

  const onAnimationToggle = (checked: boolean) => {
    setWidgetSettings(index, { ...widget.settings, animations: checked });
  };

  return (
    <Stack gap="sm">
      <Title order={5} mt="sm">
        Alert Settings
      </Title>

      <Select
        label="Alert Type"
        value={alertType}
        onChange={onAlertTypeChange}
        data={[
          { value: "disk", label: "Disk" },
          { value: "status", label: "Status" },
          { value: "network", label: "Network" },
        ]}
      />

      <Switch
        label="Enable Animations"
        checked={animationsEnabled}
        onChange={(event) => onAnimationToggle(event.currentTarget.checked)}
      />
    </Stack>
  );
}

export default AlertDrawer;
