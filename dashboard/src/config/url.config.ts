import { UrlConfig, UrlNode } from "../types/config.types.ts";

const config: UrlConfig = {
    production: {
        api_requests: `http://${window.location.hostname}/api`,
        api_websockets: `ws://${window.location.hostname}/api`,
    },
    development: {
        api_requests: `http://127.0.0.1:8000`,
        api_websockets: `ws://127.0.0.1:8000`,
    },
};

const mode = import.meta.env.MODE;

export default (config[mode] || config.development) as UrlNode;
