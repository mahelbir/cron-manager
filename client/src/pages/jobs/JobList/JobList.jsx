import {useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import Loading from "../../../components/Loading.jsx";
import LoadableComponent from "../../../components/Loadable.jsx";
import {JobItemContext} from "../../../contexts/JobItemContext.jsx";
import useSocketStore from "../../../stores/socketStore.js";
import {socketEffect} from "../../../utils/socket.js";
import {apiRequest} from "../../../utils/helper.js";
import JobItem from "./components/JobItem.jsx";
import {useAutoAnimate} from "@formkit/auto-animate/react";


const Alert = LoadableComponent("components/Alert")

const sortByName = (jobs) => {
    return jobs.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB)
            return -1;
        else if (nameA > nameB)
            return 1;
        else
            return 0;
    })
}

const JobList = () => {

    const [animate] = useAutoAnimate()
    const socket = useSocketStore(state => state.socket)
    const isSocketLoading = useSocketStore(state => state.isLoading)
    const isSocketConnected = useSocketStore(state => state.isConnected)
    const [error, setError] = useState(null)
    const [times, setTimes] = useState({})
    const {isFetching, isSuccess, failureReason: errorJobs, data: jobs} = useQuery({
        queryKey: ['JobList'],
        queryFn: async () => {
            const res = await apiRequest("jobs");
            return res.data
        }
    })

    useEffect(() => {
        if (jobs) {
            const times = {}
            jobs.forEach(job => times[job.id] = job.activity)
            setTimes(times)
        }
    }, [jobs?.length])

    useEffect(() => socketEffect(socket, [
        {
            name: "time",
            on: event => setTimes(prev => ({...prev, [event.id]: event.time}))
        }
    ]), [isSocketLoading])

    return (
        <>
            <Loading enabled={isFetching}></Loading>
            <Alert enabled={isSuccess && jobs?.length === 0}>No jobs found!</Alert>
            <Alert type="error" enabled={!isSocketLoading && !isSocketConnected}>Socket is not connected!</Alert>
            <Alert
                type="error"
                enabled={!!errorJobs || !!error}
                extra={errorJobs}
            >
                {import.meta.env.VITE_ERROR}
            </Alert>

            {jobs?.length > 0 && (
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
                        <tbody ref={animate}>
                        {sortByName(jobs).map(job => (
                            <JobItemContext.Provider
                                value={{job, setError, jobActivity: times[job.id]}}
                                key={job.id}
                            >
                                <JobItem/>
                            </JobItemContext.Provider>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}

export default JobList;