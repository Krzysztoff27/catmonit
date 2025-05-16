import TargetSelect from "../../interactive/input/TargetSelect/TargetSelect";
import { useWidgets } from "../../../contexts/WidgetContext/WidgetContext";

function OverallDeviceStorageDrawer({ index }) {
    const { getWidget } = useWidgets();
    const widget = getWidget(index);

    return (
        <>
            <TargetSelect
                index={index}
                widget={widget}
            />
        </>
    );
}

export default OverallDeviceStorageDrawer; // ! @TODO napisac ile dyskow sie wywietli przy tym rozmiarze
