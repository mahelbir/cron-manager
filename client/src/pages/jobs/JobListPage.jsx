import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../contexts/AuthContext.jsx";
import Alert, {alertCall} from "../../components/Alert.jsx";
import {apiRequest} from "../../utils/helper.js";
import JobItem from "../../components/JobItem.jsx";
import {JobItemContext} from "../../contexts/JobItemContext.jsx";
import {LoadingContext} from "../../contexts/LoadingContext.jsx";


const JobListPage = () => {

    const {dispatchAuth} = useContext(AuthContext)
    const {setLoadingIcon} = useContext(LoadingContext)
    const [error, setError] = useState(null)
    const [jobs, setJobs] = useState([])

    useEffect(() => {
        setLoadingIcon(true)
        apiRequest("jobs")
            .then(res => {
                setJobs(res.data)
            })
            .catch(e => {
                alertCall(import.meta.env.VITE_ERROR, setError)
                e?.response?.status === 401 && dispatchAuth({type: "LOGOUT"})
            })
            .finally(() => setLoadingIcon(false))

        return () => {
            setJobs([])
            setError(null)
        }
    }, []);

    return (
        <>
            {error && <Alert type="error">{error}</Alert>}

            {jobs.length === 0 && <Alert>No jobs found!</Alert>}

            {jobs.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                        <tr>
                            <td>Name</td>
                            <td>Interval</td>
                            <td>Last Run</td>
                            <td></td>
                        </tr>
                        </thead>
                        <tbody>
                        {jobs.map(job => (
                            <JobItemContext.Provider value={{job, setJobs, setError}} key={job.id}>
                                <JobItem></JobItem>
                            </JobItemContext.Provider>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}

export default JobListPage;