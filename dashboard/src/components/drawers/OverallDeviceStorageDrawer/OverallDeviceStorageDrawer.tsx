import DeviceSelect from "../../interactive/input/DeviceSelect/DeviceSelect";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";

function OverallDeviceStorageDrawer({ index }) {
    const { getWidget } = useWidgets();
    const widget = getWidget(index);

    return (
        <>
            <DeviceSelect
                index={index}
                widget={widget}
            />
        </>
    );
}

export default OverallDeviceStorageDrawer; // ! TODO napisac ile dyskow sie wywietli przy tym rozmiarze
