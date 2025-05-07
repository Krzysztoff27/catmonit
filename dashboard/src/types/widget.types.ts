import { Component, ComponentType } from "react";

export interface WidgetData {
    type: string;
    rect: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    data: any;
}

export interface WidgetLayoutProps {
    widgets: WidgetData[];
}
