import { UrlConfig, UrlNode } from "../types/config.types.ts";

const config: UrlConfig = {
    production: {
        api_requests: `https://api-web.local`,
        api_websockets: `wss://api-web.local`,
    },
    development: {
        api_requests: `https://api-web.local`,
        api_websockets: `wss://api-web.local`,
    },
};

const mode = import.meta.env.MODE;

const URL_CONFIG: UrlNode = config[mode] || config.development;

export default URL_CONFIG;
