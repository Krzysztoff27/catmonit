import { useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import urlConfig from "../config/url.config";
import useAuth from "./useAuth";
import { normalizePath } from "../utils/misc";

export default function useApiWebSocket(path: string) {
    const API_WEBSOCKET_URL: string = urlConfig.api_websockets;
    const socketUrl = `${API_WEBSOCKET_URL}${normalizePath(path)}`;

    const { tokens } = useAuth();
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl);

    const connectionStatus: string = {
        [ReadyState.CONNECTING]: "CONNECTING",
        [ReadyState.OPEN]: "OPEN",
        [ReadyState.CLOSING]: "CLOSING",
        [ReadyState.CLOSED]: "CLOSED",
        [ReadyState.UNINSTANTIATED]: "UNINSTANTIATED",
    }[readyState];

    const subscribe = (resourceUuids: string[]) => {};

    return {
        subscribe,
        lastJsonMessage,
        connectionStatus,
    };
}
