import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import useFetch from "../../hooks/useFetch";
import useApiRequests from "../../hooks/useApiRequests";
import { LayoutInDatabase, LayoutInfoInDatabase } from "../../types/api.types";
import { isEmpty, isUndefined } from "lodash";

interface LayoutContextType {
    loading: boolean;
    refresh: () => void;
    layouts: LayoutInfoInDatabase[];
    currentLayout: LayoutInDatabase | undefined;
    setCurrent: (name: string) => void;
    getLayouts: () => Promise<string[] | undefined>;
    getLayout: (name: string) => Promise<LayoutInDatabase | undefined>;
    updateCurrentLayout: (data: any) => Promise<any>;
    renameCurrentLayout: (newName: string) => Promise<any>;
    removeLayout: (name: string) => Promise<any>;
    createNewLayout: () => Promise<void>;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }) {
    const { loading, data: layouts, refresh } = useFetch("/layout/layouts");
    const [cookies, setCookies] = useCookies(["layoutId"]);
    // the updates during create new layout created like 4 racing conditions
    // cookies only updated after next render
    // thats why useState that copies the cookies is needed
    const [selectedLayoutId, setSelectedLayoutId] = useState<string | undefined>(cookies.layoutId);
    const [currentLayout, setCurrentLayout] = useState<LayoutInDatabase | undefined>(undefined);
    const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
    const { sendRequest } = useApiRequests();

    const setCurrent = (id: string) => {
        setCookies("layoutId", id, { path: "/" });
        setSelectedLayoutId(id);
    };

    const getLayouts = async (): Promise<string[] | undefined> => {
        return await sendRequest("GET", `/layout/layouts`);
    };

    const getLayout = async (id: string): Promise<LayoutInDatabase | undefined> => {
        if (!id) return;

        const layout = await sendRequest("GET", `/layout/layout/${id}`, undefined, undefined, () => {});
        if (!layout || layout?.message) return; // if error or message
        return layout as LayoutInDatabase;
    };

    const renameLayout = async (id: string, newName: string) => {
        return await sendRequest("PUT", `/layout/rename/${id}?new_name=${newName}`);
    };

    const renameCurrentLayout = async (newName: string) => {
        if (currentLayout?.info.name === newName) return;
        const res = await renameLayout(cookies.layoutId, newName);
        refresh();
        return res;
    };

    const removeLayout = async (id: string) => {
        await sendRequest("DELETE", `/layout/delete/${id}`);
        refresh();
    };

    const updateLayout = async (id: string, data: any) => {
        return await sendRequest("PUT", `/layout/update/${id}`, undefined, JSON.stringify(data));
    };

    const updateCurrentLayout = async (data: any) => {
        if (!currentLayout?.info.id) return null;
        return await updateLayout(currentLayout?.info.id, data);
    };

    const createNewLayout = async () => {
        let appendedNumber = 1;

        const defaultNameNumbersUsed = (layouts || [])
            .map(({ name }) => name.match(/(?<=New layout )\d+$/gm))
            .flat()
            .filter(Boolean)
            .map(Number)
            .sort((a, b) => a - b);

        while (defaultNameNumbersUsed.includes(appendedNumber)) appendedNumber++;

        const name = `New layout ${appendedNumber}`;
        const res = await sendRequest("PUT", `/layout/create/${name}`, undefined, JSON.stringify([]));

        const newLayout: LayoutInDatabase = { info: { id: res.id, name }, data: [] };

        setCurrent(res.id); // updates both cookie + local state
        setCurrentLayout(newLayout);
        refresh();
    };

    const initLayout = async (id) => {
        if (isEmpty(layouts)) {
            await createNewLayout();
            return;
        }

        if (id) {
            const layout = await getLayout(id);
            if (layout) {
                setCurrentLayout(layout);
                return;
            }
        }

        // If we got here, fallback to the first layout
        const fallback = layouts[0];

        setCurrent(fallback.id);
        const layout = await getLayout(fallback.id);
        if (layout) setCurrentLayout(layout);
    };

    useEffect(() => {
        if (!selectedLayoutId && cookies.layoutId) {
            setSelectedLayoutId(cookies.layoutId);
        }
    }, []);

    useEffect(() => {
        if (!loading && isFirstRender) {
            initLayout(cookies.layoutId);
            setIsFirstRender(false);
        }
    }, [loading]);

    useEffect(() => {
        if (loading || !layouts || isUndefined(selectedLayoutId)) return;

        initLayout(selectedLayoutId);
    }, [loading, layouts, selectedLayoutId]);

    const value = {
        loading,
        refresh,
        layouts,
        currentLayout,
        setCurrent,
        getLayout,
        getLayouts,
        updateCurrentLayout,
        renameCurrentLayout,
        removeLayout,
        createNewLayout,
    };

    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayouts() {
    const context = useContext(LayoutContext);

    if (!context) {
        throw new Error("useLayouts must be used within a LayoutProvider");
    }

    return context;
}
