import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { WidgetData } from "../../types/api.types";
import { Layout, LayoutItem, Rect } from "../../types/reactGridLayout.types";
import WIDGETS_CONFIG from "../../config/widgets.config";
import { isEmpty, isNull, isUndefined } from "lodash";
import { WidgetPropertiesContent, WidgetContent } from "../../types/components.types";
import { WidgetConfig, WidgetLimits } from "../../types/config.types";
import { useDebouncedCallback } from "@mantine/hooks";
import { useLayouts } from "../LayoutContext/LayoutContext";
import { useData } from "../DataContext/DataContext";
import urlConfig from "../../config/url.config";
import { safeObjectEntries } from "../../utils/object";

interface WidgetContextType {
    widgets: WidgetData[];
    layout: LayoutItem[];
    selected: number | null;
    setSelected: (a: ((prev: number | null) => number | null) | number | null) => void;
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
    getWidgetPropertiesContent: (widget: WidgetData) => WidgetPropertiesContent | undefined;
}

interface WidgetProviderProps {
    children: React.ReactNode;
    currentLayout?: string;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: WidgetProviderProps) {
    const { currentLayout, updateCurrentLayout } = useLayouts();
    const { websockets, data } = useData();
    const [widgets, setWidgets] = useState<WidgetData[]>([]);
    const [selected, setSelected] = useState<null | number>(null);

    useEffect(() => {
        setWidgets(currentLayout?.data || []);
        const subscriptions = {};

        currentLayout?.data?.forEach((widget: WidgetData) => {
            const config = getWidgetConfig(widget);

            if (!config.isReferingToSingularResource) return;

            if (isUndefined(subscriptions[config.dataSource])) {
                subscriptions[config.dataSource] = {
                    resourceUuids: [],
                    autoNumber: 0,
                };
            }

            if (isNull(widget.settings.target)) subscriptions[config.dataSource].autoNumber++;
            else subscriptions[config.dataSource].resourceUuids.push(widget.settings.target);
        });

        safeObjectEntries(subscriptions).map(([dataSource, { resourceUuids, autoNumber }]) => {
            websockets[dataSource].updateSubscribedResources(resourceUuids);
            websockets[dataSource].updateAutoResources(autoNumber);
        });
    }, [currentLayout?.data]);

    const saveStateToDatabase = useDebouncedCallback(() => {
        console.log("saved");
        updateCurrentLayout(widgets);
    }, 2000);

    const saveState = () => {
        console.log("saving");
        saveStateToDatabase();
    };

    const getWidgetConfig = (widget: WidgetData) => WIDGETS_CONFIG?.[widget?.type] ?? {};

    const getWidgetLimits = (widget: WidgetData) => getWidgetConfig(widget).limits;

    const getWidgetContent = (widget: WidgetData) => {
        const content = getWidgetConfig(widget).content;
        if (!content) {
            console.warn(`${widget.type} widget does not have it's content property set in the configuration. This will probably result in error.`);
        }
        return content;
    };

    const getWidgetPropertiesContent = (widget: WidgetData) => {
        const propertiesContent = getWidgetConfig(widget).propertiesContent;
        if (!propertiesContent) {
            console.warn(`${widget.type} widget does not have it's content property set in the configuration. This will probably result in error.`);
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
        saveState();
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
        saveState();
    };

    const setWidgetSettings = (index: number, newSettings: any) => {
        const widget = widgets[index];
        const config = getWidgetConfig(widget);

        if (config.isReferingToSingularResource && widget.settings?.target !== newSettings?.target) {
            websockets[config.dataSource]?.replaceSubscribedResource(widget.settings.target, newSettings.target);
        }

        setWidgets((prev) => {
            const newWidgets = [...prev];
            newWidgets[index] = {
                ...newWidgets[index],
                settings: newSettings,
                version: (newWidgets[index]?.version || 0) + 1,
            };
            return newWidgets;
        });
        saveState();
    };

    const createWidget = (type: string | null | undefined, layoutItem: LayoutItem) => {
        if (!type) return;

        const config = WIDGETS_CONFIG[type];

        if (config.isReferingToSingularResource) {
            websockets[config.dataSource].incrementAutoResources();
        }

        setWidgets((prev) => [
            ...prev,
            {
                type,
                settings: config.initialSettings,
                rect: getItemRect(layoutItem),
                version: 0,
            } as WidgetData,
        ]);
    };

    const deleteWidget = (index: number | string) => {
        const widget = widgets[index];
        const config = getWidgetConfig(widget);

        if (config.isReferingToSingularResource) {
            if (isNull(widget.settings.target)) websockets[config.dataSource].decrementAutoResources();
            else websockets[config.dataSource].removeSubscribedResource(widget.settings.target);
        }

        setWidgets((prev: WidgetData[]) => prev.filter((e, i) => i !== index));
        saveState();
    };

    const getWidgetData = (widget: WidgetData) => {
        if (!widget) return {};

        const config = getWidgetConfig(widget);
        const isSingular = config.isReferingToSingularResource;
        const source = config.dataSource;

        if (!source) {
            console.warn(`getWidgetData(): widget type "${widget.type}" has no dataSource in its config — will always return undefined.`);
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
            widgets?.map?.((widget: WidgetData, i): LayoutItem => {
                return {
                    i: `${i}`,
                    ...widget.rect,
                    ...getWidgetConfig(widget).limits,
                    isResizable: true,
                };
            }) || [],
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
