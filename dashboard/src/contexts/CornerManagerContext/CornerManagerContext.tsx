// CornerManagerContext.tsx
import { createContext, useContext, useState } from "react";

export type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

type FloaterID = string;

type CornerMap = {
    [K in Corner]?: FloaterID;
};

interface CornerManagerContextProps {
    cornerMap: CornerMap;
    assignCorner: (corner: Corner, floaterId: FloaterID) => void;
    swapCorners: (fromCorner: Corner, toCorner: Corner) => void;
    getCornerOfFloater: (floaterId: FloaterID) => Corner | undefined;
}

const CornerManagerContext = createContext<CornerManagerContextProps | null>(null);

export const useCornerManager = () => {
    const ctx = useContext(CornerManagerContext);
    if (!ctx) throw new Error("CornerManagerContext not found");
    return ctx;
};

export function CornerManagerProvider({ children }: { children: React.ReactNode }) {
    const [cornerMap, setCornerMap] = useState<CornerMap>({ topLeft: "layoutMenu", bottomRight: "widgetProperties" });

    const assignCorner = (corner: Corner, floaterId: FloaterID) => {
        setCornerMap((prev) => {
            const updated = { ...prev };
            // Remove the floater from its previous corner
            Object.entries(updated).forEach(([key, id]) => {
                if (id === floaterId) delete updated[key as Corner];
            });
            updated[corner] = floaterId;
            return updated;
        });
    };

    const swapCorners = (fromCorner: Corner, toCorner: Corner) => {
        setCornerMap((prev) => {
            const updated = { ...prev };
            const fromId = updated[fromCorner];
            const toId = updated[toCorner];

            if (fromId && toId) {
                updated[fromCorner] = toId;
                updated[toCorner] = fromId;
            }
            return updated;
        });
    };

    const getCornerOfFloater = (floaterId: FloaterID): Corner | undefined => {
        return Object.entries(cornerMap).find(([, id]) => id === floaterId)?.[0] as Corner | undefined;
    };

    return (
        <CornerManagerContext.Provider
            value={{
                cornerMap,
                assignCorner,
                swapCorners,
                getCornerOfFloater,
            }}
        >
            {children}
        </CornerManagerContext.Provider>
    );
}
