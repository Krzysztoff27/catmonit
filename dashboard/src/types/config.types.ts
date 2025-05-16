import { ComponentType } from "react";
import { WidgetComponent } from "./components.types";
import { TablerIcon } from "@tabler/icons-react";

export interface UrlNode {
    api_requests: string;
    api_websockets: string;
    traefik?: string;
    guacamole?: string;
}

export interface UrlConfig {
    production: UrlNode;
    development: UrlNode;
    staging?: UrlNode;
}

export interface WidgetLimits {
    minH: number;
    minW: number;
    maxH: number;
    maxW: number;
}

export interface WidgetConfig {
    name: string;
    dataSource: string;
    isReferingToSingularResource: boolean;
    icon: TablerIcon;
    component: WidgetComponent;
    drawer: ComponentType<any>; // TODO specify the props
    limits: WidgetLimits;
    initialSettings: any;
}

export interface WidgetsConfig {
    [widget_type: string]: WidgetConfig;
}
