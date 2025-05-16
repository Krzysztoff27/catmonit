import { ComponentType } from "react";
import { ItemCallback, Layout, LayoutItem } from "./reactGridLayout.types";

export interface WidgetContentProps {
    index: number;
    data: any;
    settings: any;
    [key: string]: any;
}

export type WidgetContent = ComponentType<WidgetContentProps>;

export interface DrawerContentProps {
    index: number;
    [key: string]: any;
}

export type DrawerContent = ComponentType<DrawerContentProps>;

export interface WidgetLayoutProps {
    selected?: number | null;
    onDragStart?: ItemCallback;
    onDrag?: ItemCallback;
    onDragStop?: ItemCallback;
    onResizeStart?: ItemCallback;
    onResize?: ItemCallback;
    onResizeStop?: ItemCallback;
    onDrop?: (layout: Layout, item: LayoutItem, e: Event) => void;
    droppingItem?: { i: string; w: number; h: number };
}
