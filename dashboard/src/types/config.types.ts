import { DrawerContent, DrawerContentProps, WidgetContent } from "./components.types";
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
    icon: TablerIcon;
    content: WidgetContent;
    propertiesContent: DrawerContent; // TODO specify the props
    dataSource?: string;
    isReferingToSingularResource: boolean;
    limits: WidgetLimits;
    initialSettings: any;
}

export interface WidgetsConfig {
    [widget_type: string]: WidgetConfig;
}
