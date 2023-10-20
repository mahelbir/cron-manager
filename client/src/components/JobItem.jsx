import {useContext, useState} from "react";
import classNames from "classnames";
import {Link} from "react-router-dom";
import {apiRequest} from "../utils/helper.js";
import {alertCall} from "./Alert.jsx";
import {JobItemContext} from "../contexts/JobItemContext.jsx";

const JobRemoveButton = () => {

    const {job, setJobs, setError} = useContext(JobItemContext);
    const [isClickable, setClickable] = useState(true);

    const handle = () => {
        if (confirm("Are you sure?")) {
            setClickable(false)
            apiRequest("jobs/" + job.id, {method: "DELETE",})
                .then(() => {
                    setJobs((prev) => prev.filter(item => item.id !== job.id))
                })
                .catch(e => alertCall(e?.response?.data?.error || e.message, setError))
                .finally(() => setClickable(true))
        }
    }

    return (
        <button className="btn btn-danger btn-sm" onClick={handle} disabled={!isClickable}><i
            className="fas fa-trash"></i></button>
    )
}

const JobStatusButton = () => {

    const {job, setError} = useContext(JobItemContext);
    const [jobStatus, setJobStatus] = useState(job.status);
    const [isClickable, setClickable] = useState(true);

    const handle = () => {
        const newStatus = !jobStatus
        setClickable(false)
        apiRequest("jobs/" + job.id, {
            method: "PATCH",
            data: {
                status: newStatus
            }
        })
            .then(() => {
                setJobStatus(newStatus)
            })
            .catch(e => alertCall(e?.response?.data?.error || e.message, setError))
            .finally(() => setClickable(true))

    }

    return (
        <button className={classNames([
            'btn-sm',
            'btn',
            (jobStatus ? 'btn-warning' : 'btn-success')
        ])} onClick={handle} disabled={!isClickable}><i className={classNames([
            'fas',
            jobStatus ? 'fa-pause' : 'fa-play'
        ])}></i></button>
    )
}

const JobItem = () => {

    const {job, jobActivity} = useContext(JobItemContext);

    return (
        <tr>
            <td>{job.name}</td>
            <td>{job.interval}</td>
            <td>{jobActivity && new Date(jobActivity * 1000).toLocaleString()}</td>
            <td>
                <div className="btn-group">
                    <JobStatusButton></JobStatusButton>
                    <Link to={'job/' + job.id} className="btn btn-primary btn-sm"><i
                        className="fas fa-edit"></i></Link>
                    <JobRemoveButton></JobRemoveButton>
                </div>
            </td>
        </tr>
    )
}

export default JobItem