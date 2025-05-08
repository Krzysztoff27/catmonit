import { ComponentType } from "react";
import { WidgetData } from "./api.types";
import { ItemCallback } from "./reactGridLayout.types";

export interface WidgetComponentProps {
    data: any;
    updateData: any;
    [key: string]: any;
}

export type WidgetComponent = ComponentType<WidgetComponentProps>;

export interface WidgetLayoutProps {
    widgets: WidgetData[];
    selected?: string | null;
    setWidgets: (callback: (widgets: WidgetData[]) => WidgetData[]) => void;
    onDragStart?: ItemCallback;
    onDrag?: ItemCallback;
    onDragStop?: ItemCallback;
    onResizeStart?: ItemCallback;
    onResize?: ItemCallback;
    onResizeStop?: ItemCallback;
}
