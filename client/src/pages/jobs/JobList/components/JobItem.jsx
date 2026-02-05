import {useContext, useEffect} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Link} from "react-router-dom";
import classNames from "classnames";
import {JobItemContext} from "../../../../stores/AppContexts.js";
import {apiRequest} from "../../../../utils/helper.js";
import {cloneDeep} from "lodash-es";
import {TopLoading} from "../../../../components/Loading.jsx";


const JobRemoveButton = () => {

    const queryClient = useQueryClient();
    const {job, setError} = useContext(JobItemContext);

    const {isPending, error, mutate} = useMutation({
        queryKey: ['JobRemove', job.id],
        enabled: false,
        mutationFn: async () => {
            const res = await apiRequest(`jobs/${job.id}`, {method: "DELETE"})
            const isDeleted = res.status === 204
            if (!isDeleted)
                throw Error("Delete error")
            return isDeleted
        },
        onSuccess: () => {
            queryClient.setQueryData(['JobList'], prev => prev.filter(item => item.id !== job.id))
        }
    })

    useEffect(() => {
        setError(error?.message)
        const timeout = setTimeout(() => setError(null), 2500)
        return () => clearTimeout(timeout)
    }, [error?.message])

    const handle = () => confirm("Are you sure?") && mutate()

    return (
        <>
            <TopLoading enabled={isPending}/>
            <button className="btn btn-danger btn-sm" onClick={handle} disabled={isPending}>
                <i className="fas fa-trash"></i>
            </button>
        </>
    )
}

const JobStatusButton = () => {

    const queryClient = useQueryClient();
    const {job, setError} = useContext(JobItemContext);
    const isActive = job.status

    const {isPending, error, mutate} = useMutation({
        mutationKey: ['JobStatus', job.id],
        mutationFn: async () => {
            return (await apiRequest(`jobs/${job.id}/toggle`, {
                method: "PATCH",
                data: {
                    status: !isActive
                }
            })).data.status
        },
        onSuccess: (status) => {
            queryClient.setQueryData(['JobList'], prev => {
                const jobs = cloneDeep(prev);
                jobs.find(item => item.id === job.id).status = status
                return jobs
            })
        }
    })

    useEffect(() => {
        setError(error?.message)
        const timeout = setTimeout(() => setError(null), 2500)
        return () => clearTimeout(timeout)
    }, [error?.message])

    return (
        <>
            <TopLoading enabled={isPending}/>
            <button
                className={classNames(
                    'btn-sm',
                    'btn',
                    {
                        'btn-warning': isActive,
                        'btn-success': !isActive
                    }
                )}
                title={
                    isActive ? 'Stop' : 'Start'
                }
                onClick={mutate}
                disabled={isPending}
            ><i className={classNames(
                'fas',
                {
                    'fa-pause': isActive,
                    'fa-play': !isActive
                }
            )}></i>
            </button>
        </>
    )
}

const JobItem = () => {

    const {job, jobActivity} = useContext(JobItemContext);

    return (
        <tr>
            <td>{job.name}</td>
            <td>{job.interval}</td>
            <td>{jobActivity > 0 && new Date(jobActivity * 1000).toLocaleString()}</td>
            <td>
                <div className="btn-group">
                    <JobStatusButton/>
                    <Link to={`job/${job.id}`} className="btn btn-primary btn-sm"><i className="fas fa-edit"></i></Link>
                    <JobRemoveButton/>
                </div>
            </td>
        </tr>
    )
}

export default JobItem