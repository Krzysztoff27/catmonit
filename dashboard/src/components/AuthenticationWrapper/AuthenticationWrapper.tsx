import React from "react";
import useFetch from "../../hooks/useFetch";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingOverlay } from "@mantine/core";

const AuthenticationWrapper = (): React.JSX.Element => {
    return <Outlet />;
    // const { error, loading, data: user } = useFetch("user");

    // if (loading) return <LoadingOverlay />;
    // if (!error && user) return <Outlet />;

    // if (error?.status === 401) return <Navigate to={"/login"} />;
    // throw error;
};

export default AuthenticationWrapper;
