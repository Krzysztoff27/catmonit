import { createContext, useContext } from "react";
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
    };

    const data = {
        disks: websockets.disks.last,
    };

    console.log(data);

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
