import {Fragment, useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import useSocketStore from "../../../stores/socketStore.js";
import {socketEffect} from "../../../utils/socket.js";
import {apiRequest, failureMessage} from "../../../utils/helper.js";
import LoadableComponent from "../../../components/Loadable.jsx";
import Loading from "../../../components/Loading.jsx";
import JobCategory from "./components/JobCategory.jsx";
import useCategoryStateStore from "../../../stores/categoryStateStore.js";
import useDeepCompareEffect from "react-use/lib/useDeepCompareEffect.js"


const Alert = LoadableComponent("components/Alert")

const JobList = () => {

    const {isFetching, isSuccess, failureReason: errorJobs, data: jobs} = useQuery({
        queryKey: ['JobList'],
        queryFn: async () => {
            const res = await apiRequest("jobs");
            return res.data
        }
    })
    const socket = useSocketStore(state => state.socket)
    const isSocketLoading = useSocketStore(state => state.isLoading)
    const isSocketConnected = useSocketStore(state => state.isConnected)
    const [error, setError] = useState(null)
    const [times, setTimes] = useState({})
    const [categories, setCategories] = useState({})
    const categoryStates = useCategoryStateStore(state => state.categoryStates)
    const setCategoryStates = useCategoryStateStore(state => state.setCategoryStates)
    const toggleCategoryState = useCategoryStateStore(state => state.toggleCategoryState)

    useDeepCompareEffect(() => {
        console.log("render")
        if (jobs) {
            const categories = {}
            const states = {...categoryStates};
            jobs.forEach((job, jobIndex) => {
                const category = new URL(job.url).host
                categories[category] = categories[category] || []
                categories[category].push(jobIndex)
                if (states[category] === undefined && job.status)
                    states[category] = true
                return categories
            })
            {
                let expandedAny = false
                const categoryNames = Object.keys(categories).sort()
                for (const categoryName of categoryNames) {
                    if (states[categoryName]) {
                        expandedAny = true
                        break
                    }
                }
                const firstCategory = categoryNames[0];
                if (states[firstCategory] === undefined && !expandedAny) states[firstCategory] = true
            }
            setCategories(categories)
            setCategoryStates(states)
            setTimes(jobs.reduce(
                (acc, job) => {
                    acc[job.id] = job.activity;
                    return acc
                },
                {}
            ))
        }
    }, [jobs])

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
                {failureMessage(errorJobs)}
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
                        <tbody>
                        {Object.keys(categories).sort().map(category => (
                            <JobCategory
                                key={category}
                                category={category}
                                categories={categories}
                                categoryStates={categoryStates}
                                toggleCategoryState={toggleCategoryState}
                                setError={setError}
                                times={times}
                                jobs={jobs}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}

export default JobList;