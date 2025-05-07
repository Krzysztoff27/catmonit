import { ComponentType } from "react";
import { WidgetComponent } from "./components.types";

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

export interface WidgetConfig {
    component: WidgetComponent;
    limits: {
        minH: number;
        minW: number;
        maxH: number;
        maxW: number;
    };
}

export interface WidgetsConfig {
    [widget_type: string]: WidgetConfig;
}
