import { createContext, useContext, useMemo, useState } from "react";
import useApiWebSocket, { useApiWebSocketReturn } from "../../hooks/useApiWebSocket";

interface DataContextType {
    websockets: {
        disks: useApiWebSocketReturn;
    };
    data: {
        disks: any;
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
            disks: websockets.disks.last,
            fileShares: websockets.fileShares.last,
            system: websockets.system.last,
            network: websockets.network.last,
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
