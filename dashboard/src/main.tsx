import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";

import App from "./App.tsx";
import theme from "./config/theme.config.ts";

import "@mantine/core/styles.css";
import "@mantine/code-highlight/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./styles/main.css";

import { CookiesProvider } from "react-cookie";
import { Notifications } from "@mantine/notifications";

createRoot(document.getElementById("root")!).render(
    <MantineProvider
        theme={theme}
        defaultColorScheme="dark"
    >
        <CookiesProvider>
            {/* <StrictMode> */}
            <Notifications />
            <App />
            {/* </StrictMode> */}
        </CookiesProvider>
    </MantineProvider>
);
