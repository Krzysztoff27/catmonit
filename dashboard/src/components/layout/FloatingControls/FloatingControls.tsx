import { useState } from "react";
import WidgetProperties from "../WidgetProperties/WidgetProperties";
import LayoutMenu from "../LayoutMenu/LayoutMenu";
import SavingLoader from "../../display/SavingLoader/SavingLoader";

const FloatingControls = ({ currentDropType, setCurrentDropType }): React.JSX.Element => {
    const [isDraggingDroppable, setIsDraggingDroppable] = useState(false);

    return (
        <>
            <LayoutMenu
                isDraggingDroppable={isDraggingDroppable}
                setIsDraggingDroppable={setIsDraggingDroppable}
                currentDropType={currentDropType}
                setCurrentDropType={setCurrentDropType}
            />
            <WidgetProperties />
            <SavingLoader />
        </>
    );
};

export default FloatingControls;
