import { Stack, Title } from "@mantine/core";
import { WidgetPropertiesContentProps } from "../../../types/components.types";
import DeviceSelect from "../../interactive/input/DeviceSelect/DeviceSelect";
import { safeObjectValues } from "../../../utils/object";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";

function DeviceStatusDrawer({ index }: WidgetPropertiesContentProps) {
    const { getWidget } = useWidgets();
    const widget = getWidget(index);

    if (!widget) {
        return (
            <Stack>
                <Title order={5}>Widget data not found.</Title>
            </Stack>
        );
    }

    return (
        <DeviceSelect
            index={index}
            widget={widget}
        />
    );
}

export default DeviceStatusDrawer;