import useFetch from "../../../hooks/useFetch";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingOverlay } from "@mantine/core";
import React from "react";
import useNotifications from "../../../hooks/useNotifications";

const AuthenticationWrapper = (): React.JSX.Element => {
    // return <Outlet />;
    const { sendErrorNotification } = useNotifications();
    const { error, loading, data: user } = useFetch("/api/login/userCheck");

    if (loading) return <LoadingOverlay />;
    if (!error && user) return <Outlet />;
    if (error?.status && (error?.status === 401 || error?.status >= 500)) {
        sendErrorNotification(error?.status);
    }
    return <Navigate to={"/login"} />;
};

export default AuthenticationWrapper;
