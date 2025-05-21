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
    updateLayout: (name: string, data: any) => Promise<any>;
    renameCurrentLayout: (newName: string) => Promise<any>;
    removeLayout: (name: string) => Promise<any>;
    createNewLayout: () => Promise<string>;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }) {
    const { loading, data: layouts, refresh } = useFetch("/layout/layouts");
    const [cookies, setCookies] = useCookies(["layout_id"]);
    const [currentLayout, setCurrentLayout] = useState<LayoutInDatabase | undefined>(undefined);
    const { sendRequest } = useApiRequests();

    const setCurrent = (id: string) => setCookies("layout_id", id, { path: "/" });

    const getLayouts = async (): Promise<string[] | undefined> => {
        return await sendRequest("GET", `/layout/layouts`);
    };

    const getLayout = async (id: string): Promise<LayoutInDatabase | undefined> => {
        return await sendRequest("GET", `/layout/layout/${id}`);
    };

    const renameLayout = async (id: string, newName: string) => {
        return await sendRequest("PUT", `/layout/rename/${id}?new_name=${newName}`);
    };

    const renameCurrentLayout = async (newName: string) => {
        if (currentLayout?.info.name === newName) return;
        const res = await renameLayout(cookies.layout_id, newName);
        console.log(res);
        refresh();
    };

    const removeLayout = async (id: string) => {
        await sendRequest("DELETE", `/layout/delete/${id}`);
        refresh();
    };

    const updateLayout = async (id: string, data: any) => {
        return await sendRequest("PUT", `/layout/update/${id}`, undefined, JSON.stringify(data));
    };

    const createNewLayout = async () => {
        let appendedNumber: number = 1;

        const defaultNameNumbersUsed = (layouts || [])
            .map(({ name }) => name.match(/(?<=New layout )\d+$/gm))
            .flat()
            .sort((a, b) => (parseInt(a) > parseInt(b) ? 1 : -1));

        while (`${appendedNumber}` === defaultNameNumbersUsed[appendedNumber - 1]) appendedNumber++;

        const name = `New layout ${appendedNumber}`;
        const res = await sendRequest("PUT", `/layout/create/${name}`, undefined, JSON.stringify({}));
        refresh();
        return res.id;
    };

    useEffect(() => {
        if (loading) return;

        const getCurrentLayout = async () => {
            console.log(cookies.layout_id);
            if (isEmpty(layouts)) {
                const id = await createNewLayout();
                setCurrent(id);
                setCurrentLayout(await getLayout(id));
                return;
            }

            const doesntExist = isUndefined((layouts || []).find((l: LayoutInfoInDatabase) => l.id === cookies.layout_id));

            if (doesntExist) {
                setCurrent(layouts[0].id);
                setCurrentLayout(await getLayout(layouts[0].id));
                return;
            }

            const layout = await getLayout(cookies.layout_id);
            setCurrentLayout(layout);
        };

        getCurrentLayout();
    }, [loading, cookies.layout_id]);

    const value = {
        loading,
        refresh,
        layouts,
        currentLayout,
        setCurrent,
        getLayout,
        getLayouts,
        updateLayout,
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
