import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";

import App from "./App.tsx";
import theme from "./config/theme.config.ts";

import "@mantine/core/styles.css";
import "@mantine/code-highlight/styles.css";
import "./styles/main.css";

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
