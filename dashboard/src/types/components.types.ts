import { ComponentType } from "react";
import { WidgetData } from "./api.types";

export interface WidgetComponentProps {
    data: any;
    updateData: any;
    [key: string]: any;
}

export type WidgetComponent = ComponentType<WidgetComponentProps>;

export interface WidgetLayoutProps {
    widgets: WidgetData[];
    setWidgets: (callback: (widgets: WidgetData[]) => WidgetData[]) => void;
}
