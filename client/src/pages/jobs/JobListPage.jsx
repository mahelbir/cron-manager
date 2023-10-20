import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../contexts/AuthContext.jsx";
import Alert, {alertCall} from "../../components/Alert.jsx";
import {apiRequest} from "../../utils/helper.js";
import JobItem from "../../components/JobItem.jsx";
import {JobItemContext} from "../../contexts/JobItemContext.jsx";
import {LoadingContext} from "../../contexts/LoadingContext.jsx";
import socket, {socketEffect} from "../../utils/socket.js";


const JobListPage = () => {

    const {dispatchAuth} = useContext(AuthContext)
    const {setLoadingIcon} = useContext(LoadingContext)
    const [error, setError] = useState(null)
    const [jobs, setJobs] = useState([])
    const [times, setTimes] = useState({})
    const [isCheck, setIsCheck] = useState(false)
    const [isConnected, setIsConnected] = useState(socket.connected)

    const handleActivity = (event) => {
        setTimes(prev => ({...prev, [event.id]: event.time}))
    }

    useEffect(() => {
        const data = {}
        jobs.forEach(job => data[job.id] = job.activity)
        setTimes(data)
    }, [jobs])

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
            setTimes({})
            setError(null)
        }
    }, [])

    useEffect(() => socketEffect([
        {
            name: "time",
            on: handleActivity
        }
    ], setIsConnected), [])

    setTimeout(() => setIsCheck(true), 2500)

    return (
        <>
            {error && <Alert type="error">{error}</Alert>}

            {jobs.length === 0 && <Alert>No jobs found!</Alert>}

            {isCheck && !isConnected && <Alert type={"error"}>Socket is not connected!</Alert>}

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