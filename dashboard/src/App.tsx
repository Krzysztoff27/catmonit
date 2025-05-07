import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Main from "./pages/Main/Main";
import LoginPage from "./pages/Login/Login";
import AuthenticationWrapper from "./components/AuthenticationWrapper/AuthenticationWrapper";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route element={<AuthenticationWrapper />}>
                <Route
                    path="/"
                    element={<Main />}
                />
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
