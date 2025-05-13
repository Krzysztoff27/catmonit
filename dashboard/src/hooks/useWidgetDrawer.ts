import { useState } from "react";
import WIDGETS_CONFIG from "../config/widgets.config";
import { Layout, LayoutItem } from "../types/reactGridLayout.types";
import { WidgetData } from "../types/api.types";
import { Box } from "@mantine/core";

export default function useWidgetDrawer(widgets: WidgetData[]) {
    const [isOpened, setIsOpened] = useState<boolean>(false);
    const [selected, setSelected] = useState<string | null>(null);

    let clicked = false;

    const onWidgetDragStart = () => {
        clicked = true;
        setTimeout(() => (clicked = false), 500); // verify its an a singular, short click
    };

    const onWidgetDragStop = (_: Layout, before: LayoutItem, after: LayoutItem) => {
        if (!clicked || JSON.stringify(before) !== JSON.stringify(after)) return;
        setSelected(after.i);
        setIsOpened(true);
    };

    const closeWidgetDrawer = () => {
        setIsOpened(false);
        setSelected(null);
    };

    const DrawerComponent = selected ? WIDGETS_CONFIG[widgets[selected].type].drawer : Box;

    return { isOpened, selected, onWidgetDragStart, onWidgetDragStop, closeWidgetDrawer, DrawerComponent };
}
