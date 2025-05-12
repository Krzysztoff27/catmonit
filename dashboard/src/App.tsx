import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import EditorTemplate from "./components/templates/EditorTemplate/EditorTemplate";
import AuthenticationWrapper from "./components/wrappers/AuthenticationWrapper/AuthenticationWrapper";
import Editor from "./pages/Editor/Editor";
import LoginPage from "./pages/Login/Login";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route element={<AuthenticationWrapper />}>
                <Route element={<EditorTemplate />}>
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
