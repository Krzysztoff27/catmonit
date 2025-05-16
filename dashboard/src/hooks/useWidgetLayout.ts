import { useState } from "react";
import { WidgetData } from "../types/api.types";
import { Layout, LayoutItem, Rect } from "../types/reactGridLayout.types";
import WIDGETS_CONFIG from "../config/widgets.config";
import { isEmpty } from "lodash";

export default function useWidgetLayout(name: string) {
    const path = encodeURI(name);
    const [widgets, setWidgets] = useState<WidgetData[]>([]);

    const saveStateToDatabase = () => {};

    const getLimits = (widget: WidgetData) => WIDGETS_CONFIG[widget.type].limits;

    const getComponent = (widget: WidgetData) => WIDGETS_CONFIG[widget.type].component;

    const getItemRect = (item: LayoutItem) => ({
        x: item.x,
        y: item.y,
        h: item.h,
        w: item.w,
    });

    const layout = widgets.map(
        (widget: WidgetData, i): LayoutItem => ({
            i: `${i}`,
            ...widget.rect,
            ...getLimits(widget),
        })
    );

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

    const setWidgetRect = (index: number, rect: Rect) => {
        setWidgets((prev: WidgetData[]) => {
            prev[index].rect = rect;
            return prev;
        });
        console.log(index);
        saveStateToDatabase();
    };

    const setWidgetSettings = (index: number, newSettings: any) => {
        setWidgets((prev: WidgetData[]) => {
            prev[index].settings = newSettings;
            return prev;
        });
        saveStateToDatabase();
    };

    const createWidget = (type: string | null | undefined, layoutItem: LayoutItem) => {
        if (!type) return;
        setWidgets((prev) => [
            ...prev,
            {
                type,
                settings: {},
                rect: getItemRect(layoutItem),
            } as WidgetData,
        ]);
    };

    const deleteWidget = (index: number | string) => {
        setWidgets((prev: WidgetData[]) => prev.filter((e, i) => i !== index));
        saveStateToDatabase();
    };

    return {
        widgets,
        getLimits,
        getComponent,
        layout,
        setWidgetRects,
        setWidgetRect,
        setWidgetSettings,
        createWidget,
        deleteWidget,
    };
}
