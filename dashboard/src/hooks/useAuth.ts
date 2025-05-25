import { useMemo } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

/**
 * Custom react hook providing the application with authentication support.
 */

type TokenType = "access_token" | "refresh_token";

interface Tokens {
    access_token: string | null;
    refresh_token: string | null;
}

interface useAuthReturn {
    tokens: Tokens;
    authOptions: RequestInit;
    refreshOptions: RequestInit;
    logout: () => void;
    clearTokens: () => void;
    setAccessToken: (token: string | null) => void;
    setRefreshToken: (token: string | null) => void;
}

export default function useAuth(): useAuthReturn {
    const [cookies, setCookies] = useCookies(["access_token", "refresh_token"]);
    const navigate = useNavigate();

    const setToken = (tokenType: TokenType, newToken: string | null) => setCookies(tokenType, newToken, { path: "/" });

    const setAccessToken = (token: string | null) => setToken("access_token", token);
    const setRefreshToken = (token: string | null) => setToken("refresh_token", token);

    const clearTokens = () => {
        setAccessToken(null);
        setRefreshToken(null);
    };

    const logout = () => {
        clearTokens();
        navigate("/login");
    };

    const tokens = useMemo(
        () => ({
            access_token: cookies.access_token,
            refresh_token: cookies.refresh_token,
        }),
        [cookies.access_token, cookies.refresh_token]
    );

    const getTokenOptions = (token: string) => ({
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Accept: "application/json",
            Authentication: `${token}`,
        },
    });

    const authOptions = useMemo(() => getTokenOptions(cookies.access_token), [cookies.access_token]);

    const refreshOptions = useMemo(() => getTokenOptions(cookies.refresh_token), [cookies.refresh_token]);

    return {
        setAccessToken,
        setRefreshToken,
        clearTokens,
        logout,
        tokens,
        authOptions,
        refreshOptions,
    };
}
