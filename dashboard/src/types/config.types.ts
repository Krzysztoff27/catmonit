import { ComponentType } from "react";

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
    component: ComponentType<{ data: any; [key: string]: any }>;
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
