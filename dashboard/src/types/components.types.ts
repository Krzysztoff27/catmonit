import { ComponentType } from "react";
import { WidgetData } from "./api.types";
import { ItemCallback, Layout, LayoutItem } from "./reactGridLayout.types";

export interface WidgetComponentProps {
    data: any;
    settings: any;
    className: string;
    [key: string]: any;
}

export type WidgetComponent = ComponentType<WidgetComponentProps>;

export interface WidgetLayoutProps {
    widgets: WidgetData[];
    getComponent: (widget: WidgetData) => WidgetComponent;
    deleteWidget: (index: string | number) => void;
    layout: Layout;
    updateLayout: (layout: Layout) => void;
    selected?: string | null;
    onDragStart?: ItemCallback;
    onDrag?: ItemCallback;
    onDragStop?: ItemCallback;
    onResizeStart?: ItemCallback;
    onResize?: ItemCallback;
    onResizeStop?: ItemCallback;
    onDrop?: (layout: Layout, item: LayoutItem, e: Event) => void;
    droppingItem?: { i: string; w: number; h: number };
}
