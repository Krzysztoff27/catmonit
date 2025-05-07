import urlConfig from "../config/url.config.ts";
import useAuth from "./useAuth.ts";

const responseOnNoResponse = new Response(JSON.stringify({ detail: "No response from server" }), {
    status: 503,
    headers: { "Content-Type": "text/plain" },
});

const handleFetch = async (
    URL: string,
    options: RequestInit = {},
    errorCallback: (response: Response, body: { [key: string]: any }) => void,
    tryRefreshingTokens: () => Promise<string | null>
) => {
    const fetchData = async () => await fetch(URL, options).catch(() => responseOnNoResponse);

    let response = await fetchData();

    if (`${response.status}` === "401") {
        const token = await tryRefreshingTokens();
        if (token) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            };
            response = await fetchData();
        }
    }

    // handle no content reponses
    let json = {};

    try {
        const text = await response.text();
        json = text ? JSON.parse(text) : {};
    } catch (err) {
        console.error(`Couldn't parse request response. URL=${URL}`, err);
    }

    if (!response.ok) return errorCallback(response, json);
    return json;
};

export const useApiRequests = () => {
    const API_URL: string = urlConfig.api_requests;
    const { authOptions, refreshOptions, setAccessToken, setRefreshToken } = useAuth();

    const normalizePath = (path = "") => (path.startsWith("/") ? path : `/${path}`);

    const getPath = (path: string): string => (API_URL ? `${API_URL}${normalizePath(path)}` : "");

    const parseAndHandleError = (response, body) => console.error(response, body);

    const refreshTokens = async () => {
        return fetch(getPath("refresh"), refreshOptions)
            .then(res => res.ok && res.json())
            .then(json => {
                setAccessToken(json?.access_token);
                setRefreshToken(json?.refresh_token);
                return json?.access_token;
            })
            .catch(err => {
                console.error("Error occured while parsing response body during token refresh.\n", err);
                return null;
            });
    };

    const sendRequest = async (
        path: string,
        method: string = "GET",
        options: RequestInit = {},
        body: BodyInit | undefined = undefined,
        errorCallback: (response: Response, body: { [key: string]: any }) => void = parseAndHandleError
    ): Promise<any> =>
        await handleFetch(
            getPath(path),
            {
                ...authOptions,
                ...options,
                method: method,
                body: body,
            },
            errorCallback,
            refreshTokens
        );

    return { getPath, sendRequest };
};

export default useApiRequests;
