import { ComponentType } from "react";
import { ItemCallback, Layout, LayoutItem } from "./reactGridLayout.types";

export interface WidgetContentProps {
    index: number;
    data: any;
    settings: any;
    [key: string]: any;
}

export type WidgetContent = ComponentType<WidgetContentProps>;

export interface WidgetPropertiesContentProps {
    index: number;
    [key: string]: any;
}

export type WidgetPropertiesContent = ComponentType<WidgetPropertiesContentProps>;

export interface WidgetLayoutProps {
    editable?: boolean;
    onDrop?: (layout: Layout, item: LayoutItem, e: Event) => void;
    droppingItem?: { i: string; w: number; h: number };
}
