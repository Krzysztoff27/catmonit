import useWebSocket, { ReadyState } from "react-use-websocket";
import URL_CONFIG from "../config/url.config";
import useAuth from "./useAuth";
import { normalizePath } from "../utils/api";
import { WebSocketStart } from "../types/api.types";
import { useEffect, useState } from "react";
import { isNull } from "lodash";
import { removeOneFromArray } from "../utils/array";

export interface useApiWebSocketReturn {
    updateSubscription: (subscription: WebSocketStart) => void;
    replaceSubscribedResource: (oldResourceUuid: string | null, newResourceUuid: string | null) => void;
    updateSubscribedResources: (resourceUuids: string[]) => void;
    addSubscribedResource: (resourceUuid: string) => void;
    removeSubscribedResource: (resourceUuid: string) => void;
    updateAutoResources: (count: number) => void;
    incrementAutoResources: (incrementBy?: number) => void;
    decrementAutoResources: (decrementBy?: number) => void;
    updateNumberOfWarnings: (numberOfWarnings: number) => void;
    updateNumberOfErrors: (numberOfErrors: number) => void;
    unsubscribe: () => void;
    readyState: ReadyState;
    last: unknown;
}

export default function useApiWebSocket(path: string): useApiWebSocketReturn {
    const { tokens } = useAuth();

    const API_WEBSOCKET_URL: string = URL_CONFIG.api_websockets;
    const socketUrl = `${API_WEBSOCKET_URL}${normalizePath(path)}?Authentication=${tokens.access_token}`;

    const [subscription, setSubscription] = useState<WebSocketStart | null>({ message: "start" });
    const { readyState, lastJsonMessage, sendJsonMessage } = useWebSocket(socketUrl);

    const replaceSubscribedResource = (oldResourceUuid: string | null, newResourceUuid: string | null) => {
        setSubscription((prev) => {
            let auto = prev?.auto ?? 0;
            let devices = prev?.devices ?? [];

            if (!isNull(oldResourceUuid)) devices = removeOneFromArray(devices, oldResourceUuid);
            if (!isNull(newResourceUuid)) devices.push(newResourceUuid);

            return { ...prev, auto, devices } as WebSocketStart;
        });
    };

    const updateSubscription = (subscription: WebSocketStart) => {
        setSubscription((prev) => ({ ...prev, ...subscription } as WebSocketStart));
    };

    const updateSubscribedResources = (resourceUuids: string[]) => {
        setSubscription((prev) => ({ ...prev, devices: resourceUuids } as WebSocketStart));
    };

    const addSubscribedResource = (resourceUuid: string) => {
        setSubscription((prev) => ({ ...prev, devices: [...(prev?.devices ?? []), resourceUuid] } as WebSocketStart));
    };

    const removeSubscribedResource = (resourceUuid: string) => {
        setSubscription((prev) => ({ ...prev, devices: [...(prev?.devices ?? []).filter((e) => e !== resourceUuid)] } as WebSocketStart));
    };

    const updateAutoResources = (count: number = 0) => {
        setSubscription((prev) => ({ ...prev, auto: count } as WebSocketStart));
    };

    const incrementAutoResources = (incrementBy: number = 1) => {
        setSubscription((prev) => ({ ...prev, auto: (prev?.auto ?? 0) + incrementBy } as WebSocketStart));
    };

    const decrementAutoResources = (decrementBy: number = 1) => {
        setSubscription((prev) => ({ ...prev, auto: Math.max((prev?.auto ?? 0) - decrementBy, 0) } as WebSocketStart));
    };

    const updateNumberOfWarnings = (numberOfWarnings: number) => {
        setSubscription((prev) => ({ ...prev, warningsCount: numberOfWarnings } as WebSocketStart));
    };

    const updateNumberOfErrors = (numberOfErrors: number) => {
        setSubscription((prev) => ({ ...prev, errorsCount: numberOfErrors } as WebSocketStart));
    };

    const unsubscribe = () => {
        setSubscription(null);
        sendJsonMessage({ message: "stop" });
    };

    useEffect(() => {
        if (!subscription) return;
        sendJsonMessage(subscription);
    }, [subscription]);

    return {
        replaceSubscribedResource,
        updateSubscribedResources,
        updateNumberOfWarnings,
        updateNumberOfErrors,
        updateSubscription,
        addSubscribedResource,
        removeSubscribedResource,
        updateAutoResources,
        incrementAutoResources,
        decrementAutoResources,
        unsubscribe,
        readyState,
        last: lastJsonMessage,
    };
}
