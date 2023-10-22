import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../contexts/AuthContext.jsx";
import Alert, {alertCall} from "../../components/Alert.jsx";
import {apiRequest} from "../../utils/helper.js";
import JobItem from "../../components/JobItem.jsx";
import {JobItemContext} from "../../contexts/JobItemContext.jsx";
import {LoadingContext} from "../../contexts/LoadingContext.jsx";
import {initSocket, socketEffect} from "../../utils/socket.js";
import {SocketContext} from "../../contexts/SocketContext.jsx";


const JobListPage = () => {

    const {dispatchAuth} = useContext(AuthContext)
    const {setLoadingIcon} = useContext(LoadingContext)
    const {socket, socketCheck, isSocketConnected, setIsSocketConnected} = useContext(SocketContext)
    const [isPageReady, setIsPageReady] = useState(false)
    const [error, setError] = useState(null)
    const [jobs, setJobs] = useState([])
    const [times, setTimes] = useState({})

    const handleActivity = (event) => {
        setTimes(prev => ({...prev, [event.id]: event.time}))
    }

    useEffect(() => {
        const data = {}
        jobs.forEach(job => data[job.id] = job.activity)
        setTimes(data)
    }, [jobs])

    useEffect(() => {
        setTimeout(() => setIsPageReady(true), 2500)
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
            setTimes({})
            setError(null)
        }
    }, [])

    useEffect(() => socketEffect(socket, [
        {
            name: "time",
            on: handleActivity
        }
    ], setIsSocketConnected), [socket])

    return (
        <>
            {error && <Alert type="error">{error}</Alert>}

            {isPageReady && jobs.length === 0 && <Alert>No jobs found!</Alert>}

            {socketCheck && !isSocketConnected && <Alert type={"error"}>Socket is not connected!</Alert>}

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
                            <JobItemContext.Provider value={{job, setJobs, setError, jobActivity: times[job.id]}}
                                                     key={job.id}>
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