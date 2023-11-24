import {createBrowserRouter} from "react-router-dom";
import LoadableComponent from "./components/Loadable.jsx";
import Layout from "./components/Layout.jsx";


const Alert = LoadableComponent("components/Alert")
const Watch = LoadableComponent("pages/Watch")
const JobList = LoadableComponent("pages/jobs/JobList/JobList")
const JobAdd = LoadableComponent("pages/jobs/JobAdd/JobAdd")
const JobEdit = LoadableComponent("pages/jobs/JobEdit/JobEdit")

const router = createBrowserRouter([
    {
        element: <Layout/>,
        children: [
            {
                path: "/",
                element: <JobList/>
            },
            {
                path: "add",
                element: <JobAdd/>
            },
            {
                path: "job/:jobId",
                element: <JobEdit/>
            },
            {
                path: "watch",
                element: <Watch/>
            },
            {
                path: "*",
                element: <Alert type="error" className="h5">Page Not Found</Alert>
            }
        ],
        errorElement: <Alert type="error" className="m-5 h5">{import.meta.env.VITE_ERROR}</Alert>
    }
])

export default router