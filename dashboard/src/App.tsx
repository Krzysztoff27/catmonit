import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/Login/Login";
import AuthenticationWrapper from "./components/AuthenticationWrapper/AuthenticationWrapper";
import DashboardLayout from "./components/DashboardLayout/DashboardLayout";
import Editor from "./pages/Editor/Editor";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route element={<AuthenticationWrapper />}>
                <Route element={<DashboardLayout />}>
                    <Route
                        path="/"
                        element={<Navigate to={"/editor/TOBEREMOVED"} />}
                    />
                    <Route
                        path="/editor/:layoutName"
                        element={<Editor />}
                    />
                </Route>
            </Route>
            <Route
                path="/login"
                element={<LoginPage />}
            />
        </Route>
    )
);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
