import { createContext, useContext, useMemo, useState } from "react";
import { WidgetData } from "../../types/api.types";
import { Layout, LayoutItem, Rect } from "../../types/reactGridLayout.types";
import WIDGETS_CONFIG from "../../config/widgets.config";
import { isEmpty } from "lodash";
import { DrawerContent, WidgetContent } from "../../types/components.types";
import { WidgetConfig, WidgetLimits } from "../../types/config.types";

interface WidgetContextType {
    widgets: WidgetData[];
    layout: LayoutItem[];
    selected: number | null;
    setSelected: (selected: number | null) => void;
    getData: (source: string) => any;
    getWidget: (index: number | string) => WidgetData;
    createWidget: (type: string | null | undefined, layoutItem: LayoutItem) => void;
    deleteWidget: (index: number | string) => void;
    setWidgetRects: (newLayout: Layout) => void;
    setWidgetRect: (index: number, rect: any) => void;
    setWidgetSettings: (index: number, newSettings: any) => void;
    getWidgetData: (widget: WidgetData) => any;
    getWidgetLimits: (widget: WidgetData) => WidgetLimits;
    getWidgetContent: (widget: WidgetData) => WidgetContent;
    getWidgetConfig: (widget: WidgetData) => WidgetConfig;
    getWidgetPropertiesContent: (widget: WidgetData) => DrawerContent;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children, initialData }: { children: React.ReactNode; initialData: any }) {
    const [widgets, setWidgets] = useState<WidgetData[]>([
        {
            type: "DETAILED_DEVICE_STORAGE",
            rect: {
                x: 0,
                y: 0,
                w: 2,
                h: 2,
            },
            settings: WIDGETS_CONFIG.DETAILED_DEVICE_STORAGE.initialSettings,
            version: 0,
        },
    ]);
    const [data, setData] = useState(initialData);
    const [selected, setSelected] = useState(null);

    const saveStateToDatabase = () => {};

    const getWidgetConfig = (widget: WidgetData) => WIDGETS_CONFIG?.[widget?.type] ?? {};

    const getWidgetLimits = (widget: WidgetData) => getWidgetConfig(widget).limits;

    const getWidgetContent = (widget: WidgetData) => {
        const content = getWidgetConfig(widget).content;
        if (!content) {
            //console.warn(`${widget.type} widget does not have it's content property set in the configuration. This will probably result in error.`);
        }
        return content;
    };

    const getWidgetPropertiesContent = (widget: WidgetData) => {
        const propertiesContent = getWidgetConfig(widget).propertiesContent;
        if (!propertiesContent) {
            //console.warn(`${widget.type} widget does not have it's content property set in the configuration. This will probably result in error.`);
        }
        return propertiesContent;
    };

    const getItemRect = (item: LayoutItem) => ({
        x: item.x,
        y: item.y,
        h: item.h,
        w: item.w,
    });

    const setWidgetRects = (newLayout: Layout) => {
        if (isEmpty(newLayout)) return;
        setWidgets((prev: WidgetData[]) =>
            prev.map((widget: WidgetData, i) => {
                const { x, y, w, h } = newLayout[i];
                widget.rect = {
                    x,
                    y,
                    w,
                    h,
                };
                return widget;
            })
        );
        saveStateToDatabase();
    };

    const setWidgetRect = (index: number, newRect: Rect) => {
        setWidgets((prev: WidgetData[]) => {
            const newWidgets = [...prev];
            newWidgets[index] = {
                ...newWidgets[index],
                settings: newRect,
                version: (newWidgets[index]?.version || 0) + 1,
            };
            return newWidgets;
        });
        saveStateToDatabase();
    };

    const setWidgetSettings = (index: number, newSettings: any) => {
        setWidgets((prev) => {
            const newWidgets = [...prev];
            newWidgets[index] = {
                ...newWidgets[index],
                settings: newSettings,
                version: (newWidgets[index]?.version || 0) + 1,
            };
            return newWidgets;
        });
        saveStateToDatabase();
    };

    const createWidget = (type: string | null | undefined, layoutItem: LayoutItem) => {
        if (!type) return;
        setWidgets((prev) => [
            ...prev,
            {
                type,
                settings: WIDGETS_CONFIG[type].initialSettings,
                rect: getItemRect(layoutItem),
                version: 0,
            } as WidgetData,
        ]);
    };

    const deleteWidget = (index: number | string) => {
        setWidgets((prev: WidgetData[]) => prev.filter((e, i) => i !== index));
        saveStateToDatabase();
    };

    const getWidgetData = (widget: WidgetData) => {
        if (!widget) return {};

        const config = getWidgetConfig(widget);
        const isSingular = config.isReferingToSingularResource;
        const source = config.dataSource;

        if (!source) {
            //console.warn(`getWidgetData(): widget type "${widget.type}" has no dataSource in its config — will always return undefined.`);
            return;
        }

        if (!isSingular) return data[source] ?? {};

        const target = widget?.settings?.target;
        return target ? data[source]?.[target] ?? {} : {};
    };

    const getData = (source: string) => {
        return data?.[source] ?? {};
    };

    const getWidget = (index: number | string) => {
        return widgets[index];
    };

    const layout = useMemo(
        () =>
            widgets.map((widget: WidgetData, i): LayoutItem => {
                return {
                    i: `${i}`,
                    ...widget.rect,
                    ...getWidgetConfig(widget).limits,
                    isResizable: true,
                };
            }),
        [widgets]
    );

    const value = {
        widgets,
        layout,
        selected,
        setSelected,
        getData,
        getWidget,
        createWidget,
        deleteWidget,
        setWidgetRects,
        setWidgetRect,
        setWidgetSettings,
        getWidgetData,
        getWidgetContent,
        getWidgetLimits,
        getWidgetConfig,
        getWidgetPropertiesContent,
    };

    return <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>;
}

export function useWidgets() {
    const context = useContext(WidgetContext);

    if (!context) {
        throw new Error("useWidgets must be used within a WidgetProvider");
    }

    return context;
}
