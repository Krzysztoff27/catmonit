import { useState } from "react";
import WidgetProperties from "../WidgetProperties/WidgetProperties";
import LayoutMenu from "../LayoutMenu/LayoutMenu";

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
        </>
    );
};

export default FloatingControls;
