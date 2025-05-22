import { createContext, useContext, useMemo, useState } from "react";
import useApiWebSocket, { useApiWebSocketReturn } from "../../hooks/useApiWebSocket";
import { APIResponse } from "../../types/api.types";

interface DataContextType {
    websockets: {
        disks: useApiWebSocketReturn;
        fileShares: useApiWebSocketReturn;
        system: useApiWebSocketReturn;
        network: useApiWebSocketReturn;
    };
    data: {
        disks: APIResponse;
        fileShares: APIResponse;
        system: APIResponse;
        network: APIResponse;
    };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }) {
    const websockets = {
        disks: useApiWebSocket("disks"),
        fileShares: useApiWebSocket("shares"),
        system: useApiWebSocket("system"),
        network: useApiWebSocket("network"),
    };

    const data = useMemo(
        () => ({
            disks: websockets.disks.last as APIResponse,
            fileShares: websockets.fileShares.last as APIResponse,
            system: websockets.system.last as APIResponse,
            network: websockets.network.last as APIResponse,
        }),
        [websockets.disks.last, websockets.fileShares.last, websockets.system.last, websockets.network.last]
    );

    const value = {
        websockets,
        data,
    };
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const context = useContext(DataContext);

    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }

    return context;
}
