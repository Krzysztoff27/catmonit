export interface LayoutItem {
    i: string;
    w: number;
    h: number;
    x: number;
    y: number;
    maxH: number;
    minH: number;
    maxW: number;
    minW: number;
    moved?: boolean;
    static?: boolean;
    isBounded?: boolean;
    isResizable?: boolean;
    isDraggable?: boolean;
    resizeHandles?: any;
}

export interface Rect {
    w: number;
    h: number;
    y: number;
    x: number;
}

export type Layout = LayoutItem[];

export type ItemCallback = (layout: Layout, oldItem: LayoutItem, newItem: LayoutItem, placeholder: LayoutItem, e: MouseEvent, element: HTMLElement) => void;
