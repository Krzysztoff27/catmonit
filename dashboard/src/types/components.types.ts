import { ComponentType } from "react";
import { WidgetData } from "./api.types";
import { ItemCallback, Layout, LayoutItem, Rect } from "./reactGridLayout.types";
import { DrawerProps } from "@mantine/core";

export interface WidgetComponentProps {
    data: any;
    settings: any;
    className: string;
    [key: string]: any;
}

export type WidgetComponent = ComponentType<WidgetComponentProps>;

export interface DrawerComponentProps {
    index: number | string;
    [key: string]: any;
}

export type DrawerComponent = ComponentType<DrawerComponentProps>;

export interface WidgetLayoutProps {
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
