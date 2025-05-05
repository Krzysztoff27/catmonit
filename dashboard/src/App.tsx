import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import Main from "./pages/Main/Main";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route path="/" element={<Main />}/>
        </Route>
    )
);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
