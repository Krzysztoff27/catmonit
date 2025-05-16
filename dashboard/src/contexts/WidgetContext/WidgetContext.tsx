import { createContext, useContext, useMemo, useState } from "react";
import { WidgetData } from "../../types/api.types";
import { Layout, LayoutItem, Rect } from "../../types/reactGridLayout.types";
import WIDGETS_CONFIG from "../../config/widgets.config";
import { isEmpty } from "lodash";
import { WidgetComponent } from "../../types/components.types";
import { WidgetLimits } from "../../types/config.types";

interface WidgetContextType {
    widgets: WidgetData[];
    layout: LayoutItem[];
    getData: (source: string) => any;
    getWidget: (index: number | string) => WidgetData;
    createWidget: (type: string | null | undefined, layoutItem: LayoutItem) => void;
    deleteWidget: (index: number | string) => void;
    setWidgetRects: (newLayout: Layout) => void;
    setWidgetRect: (index: number, rect: any) => void;
    setWidgetSettings: (index: number, newSettings: any) => void;
    getWidgetData: (widget: WidgetData) => any;
    getWidgetLimits: (widget: WidgetData) => WidgetLimits;
    getWidgetComponent: (widget: WidgetData) => WidgetComponent;
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

    const saveStateToDatabase = () => {};

    const getWidgetLimits = (widget: WidgetData) => WIDGETS_CONFIG[widget.type].limits;

    const getWidgetComponent = (widget: WidgetData) => WIDGETS_CONFIG[widget.type].component;

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
        const config = WIDGETS_CONFIG[widget.type];
        const isSingular = config.isReferingToSingularResource;
        const source = config.dataSource;

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
                console.log(widget.type, widgets);
                return {
                    i: `${i}`,
                    ...widget.rect,
                    ...WIDGETS_CONFIG[widget.type].limits,
                };
            }),
        [widgets]
    );

    const value = {
        widgets,
        layout,
        getData,
        getWidget,
        createWidget,
        deleteWidget,
        setWidgetRects,
        setWidgetRect,
        setWidgetSettings,
        getWidgetData,
        getWidgetComponent,
        getWidgetLimits,
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
