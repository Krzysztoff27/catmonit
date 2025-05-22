import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { WebSocketStart, WidgetData } from "../../types/api.types";
import { Layout, LayoutItem, Rect } from "../../types/reactGridLayout.types";
import WIDGETS_CONFIG from "../../config/widgets.config";
import { isEmpty, isNull, isUndefined } from "lodash";
import { WidgetPropertiesContent, WidgetContent } from "../../types/components.types";
import { WidgetConfig, WidgetLimits } from "../../types/config.types";
import { useDebouncedCallback } from "@mantine/hooks";
import { useLayouts } from "../LayoutContext/LayoutContext";
import { useData } from "../DataContext/DataContext";
import { safeObjectEntries, safeObjectKeys, safeObjectValues } from "../../utils/object";
import { checkDomainOfScale } from "recharts/types/util/ChartUtils";
import { v4 as uuidv4 } from "uuid";

interface WidgetContextType {
    widgets: WidgetData[];
    layout: LayoutItem[];
    selected: number | null;
    setSelected: (a: ((prev: number | null) => number | null) | number | null) => void;
    getData: (source: string) => any;
    getWidget: (index: number) => WidgetData;
    createWidget: (type: string | null | undefined, layoutItem: LayoutItem) => void;
    deleteWidget: (index: number) => void;
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

const WIDGET_TYPES = safeObjectKeys(WIDGETS_CONFIG);
const emptyAutoRetrievalOrders = WIDGET_TYPES.reduce((prev, type) => ({ ...prev, [type]: [] }), {});

export function WidgetProvider({ children }: WidgetProviderProps) {
    const { currentLayout, updateCurrentLayout } = useLayouts();
    const [autoRetrievalOrders, setAutoRetrievalOrders] = useState(emptyAutoRetrievalOrders);
    const { websockets, data } = useData();
    const [widgets, setWidgets] = useState<WidgetData[]>([]);
    const [selected, setSelected] = useState<null | number>(null);

    const removeFromAutoRetrievalOrders = (widget: WidgetData) => {
        setAutoRetrievalOrders((prev) => {
            const newAutoRetrievalOrders = prev;
            newAutoRetrievalOrders[widget.type] = newAutoRetrievalOrders[widget.type].filter((e) => e !== widget.uuid);
            return newAutoRetrievalOrders;
        });
    };

    const appendToAutoRetrievalOrders = (widget: WidgetData) => {
        setAutoRetrievalOrders((prev) => {
            const newAutoRetrievalOrders = prev;
            newAutoRetrievalOrders[widget.type].push(widget.uuid);
            return newAutoRetrievalOrders;
        });
    };

    useEffect(() => {
        setWidgets(currentLayout?.data || []);
        const subscriptions = {};
        const newAutoRetrievalOrders = emptyAutoRetrievalOrders;

        currentLayout?.data?.forEach((widget: WidgetData) => {
            const config = getWidgetConfig(widget);

            if (!config.isReferingToSingularResource) return;

            if (isUndefined(subscriptions[config.dataSource])) {
                subscriptions[config.dataSource] = {
                    devices: [], // save which resources set widgets need
                    auto: 0, // save how many auto we need
                };
            }
            if (!isNull(widget.settings.target)) {
                subscriptions[config.dataSource].devices.push(widget.settings.target);
            } else newAutoRetrievalOrders[widget.type].push(widget.uuid);
            subscriptions[config.dataSource].auto++;
        });

        setAutoRetrievalOrders(newAutoRetrievalOrders);
        safeObjectEntries(subscriptions).forEach(([dataSource, subscription]) => {
            websockets[dataSource].updateSubscription(subscription as WebSocketStart);
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

            if (isNull(widget.settings.target)) {
                removeFromAutoRetrievalOrders(widget);
            }
            if (isNull(newSettings.target)) {
                appendToAutoRetrievalOrders(widget);
            }
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
        const uuid = uuidv4();

        if (config.isReferingToSingularResource) {
            websockets[config.dataSource].incrementAutoResources();
            appendToAutoRetrievalOrders({ type, uuid } as WidgetData);
        }

        setWidgets((prev) => [
            ...prev,
            {
                type,
                uuid,
                settings: config.initialSettings,
                rect: getItemRect(layoutItem),
                version: 0,
            } as WidgetData,
        ]);
    };

    const deleteWidget = (index: number) => {
        const widget = widgets[index];
        const config = getWidgetConfig(widget);

        if (config.isReferingToSingularResource) {
            if (isNull(widget.settings.target)) {
                websockets[config.dataSource].decrementAutoResources();
                removeFromAutoRetrievalOrders(widget);
            } else websockets[config.dataSource].removeSubscribedResource(widget.settings.target);
        }

        setWidgets((prev: WidgetData[]) => prev.filter((e, i) => i !== index));
        saveState();
    };

    const getWidgetData = (widget: WidgetData) => {
        if (!widget) return {};

        const config = getWidgetConfig(widget);
        const isSingular = config.isReferingToSingularResource;
        const source = config.dataSource;

        if (isSingular && !source) {
            console.warn(`getWidgetData(): widget type "${widget.type}" has no dataSource in its config — will always return undefined.`);
            return;
        }

        if (!isSingular) return data[source] ?? {};

        const target = widget?.settings?.target;
        if (target) return data[source].monitoredDevices[target];
        const index = autoRetrievalOrders[widget.type].findIndex((uuid: string) => uuid === widget.uuid);
        return safeObjectValues(data[source]?.autoDevices)[index];
    };

    const getData = (source: string) => {
        return data?.[source] ?? {};
    };

    const getWidget = (index: number) => {
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
