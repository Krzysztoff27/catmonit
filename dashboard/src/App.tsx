import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import EditorTemplate from "./components/templates/EditorTemplate/EditorTemplate";
import AuthenticationWrapper from "./components/wrappers/AuthenticationWrapper/AuthenticationWrapper";
import LoginPage from "./pages/Login/Login";
import Editor from "./pages/Editor/Editor";
import Dashboard from "./pages/Dashboard/Dashboard";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route element={<AuthenticationWrapper />}>
                <Route element={<EditorTemplate />}>
                    <Route
                        path="/"
                        element={<Navigate to={"/editor"} />}
                    />
                    <Route
                        path="/editor"
                        element={<Editor />}
                    />
                    <Route
                        path="/dashboard/:layoutUuid"
                        element={<Dashboard />}
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
