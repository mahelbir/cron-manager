import "bootswatch/dist/cyborg/bootstrap.min.css";

import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AuthContextProvider from "./contexts/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import JobListPage from "./pages/jobs/JobListPage.jsx";
import WatchPage from "./pages/WatchPage.jsx";
import Alert from "./components/Alert.jsx";
import JobAddPage from "./pages/jobs/JobAddPage.jsx";
import JobEditPage from "./pages/jobs/JobEditPage.jsx";
import LoadingContextProvider from "./contexts/LoadingContext.jsx";
import SocketContextProvider from "./contexts/SocketContext.jsx";


const router = createBrowserRouter([
    {
        element: <Layout/>,
        children: [
            {
                path: "/",
                element: <JobListPage/>
            },
            {
                path: "add",
                element: <JobAddPage></JobAddPage>
            },
            {
                path: "job/:jobId",
                element: <JobEditPage></JobEditPage>
            },
            {
                path: "watch",
                element: <WatchPage></WatchPage>
            },
            {
                path: "*",
                element: <Alert type="error">Page Not Found</Alert>
            }
        ],
        errorElement: <Alert type="error" className={["my-3"]}>{import.meta.env.VITE_ERROR}</Alert>
    }
])

const App = () => {
    return (
        <LoadingContextProvider>
            <AuthContextProvider>
                <SocketContextProvider>
                    <RouterProvider router={router}/>
                </SocketContextProvider>
            </AuthContextProvider>
        </LoadingContextProvider>
    )
}

export default App
