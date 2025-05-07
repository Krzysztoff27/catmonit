import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";

import App from "./App.tsx";
import theme from "./config/theme.config.ts";

import "./styles/main.css";
import "@mantine/core/styles.css";
import "@mantine/code-highlight/styles.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

createRoot(document.getElementById("root")!).render(
    <MantineProvider
        theme={theme}
        defaultColorScheme="dark"
    >
        <StrictMode>
            <App />
        </StrictMode>
    </MantineProvider>
);
