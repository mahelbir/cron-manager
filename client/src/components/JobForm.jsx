import {useContext, useEffect, useState} from "react";
import Alert, {alertCall} from "./Alert.jsx";
import {apiRequest} from "../utils/helper.js";
import {AuthContext} from "../contexts/AuthContext.jsx";
import {LoadingContext} from "../contexts/LoadingContext.jsx";


const JobForm = ({message, setMessage, job, setJob, jobId}) => {

    const {dispatchAuth} = useContext(AuthContext)
    const {setLoadingIcon} = useContext(LoadingContext)
    const [advReq, setAdvReq] = useState(false)
    const [advRes, setAdvRes] = useState(false)
    const [isClickable, setClickable] = useState(true)

    useEffect(() => {
        setAdvReq((Object.keys(job.options || {}) > 0))
        setAdvRes(Boolean(job?.response?.check))
    }, [job]);


    const handleAdvReq = () => setAdvReq(!advReq)

    const handleAdvRes = () => setAdvRes(!advRes)

    const handleForm = (ev) => {
        ev.preventDefault()

        let options = {}
        try {
            options = JSON.parse(ev.target.elements.options?.value || "{}")
        } catch {
            return alertCall("Invalid config JSON!", setMessage)
        }
        setClickable(false)
        setLoadingIcon(true)
        const data = {
            name: ev.target.elements.name.value,
            url: ev.target.elements.url.value,
            interval: +ev.target.elements.interval.value,
            status: job.status ?? true,
            method: ev.target.elements.method?.value,
            options
        }
        if (ev.target.elements["response.check"]?.value)
            data.response = {
                check: ev.target.elements["response.check"]?.value,
                interval: +ev.target.elements["response.interval"]?.value
            }
        apiRequest("jobs/" + jobId, {
            method: jobId ? "PUT" : "POST",
            data
        })
            .then(res => {
                setJob(res.data)
                alertCall("Successful", setMessage)
            })
            .catch(e => {
                e?.response?.status === 401 && dispatchAuth({type: "LOGOUT"})
                alertCall(e?.response?.data?.error || import.meta.env.VITE_ERROR, setMessage)
            })
            .finally(() => {
                setLoadingIcon(false)
                setClickable(true)
            })
    }

    return (
        <>
            {message && <Alert>{message}</Alert>}

            {!message && (
                <form onSubmit={handleForm} autoComplete="off">
                    <div className="input-group mb-3">
                        <span className="input-group-text text-bg-light">Name</span>
                        <input type="text" name="name" defaultValue={job.name} className="form-control"
                               required={true}/>
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text text-bg-light">Interval (seconds)</span>
                        <input type="number" name="interval" defaultValue={job.interval} className="form-control"
                               min={0}
                               required={true}/>
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text text-bg-light">Visit URL</span>
                        <input type="url" name="url" defaultValue={job.url} className="form-control" required={true}/>
                    </div>
                    <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" value="advReq" checked={advReq}
                               onChange={handleAdvReq}/>
                        <label className="form-check-label">Advanced Request</label>
                    </div>
                    <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" value="advReq" checked={advRes}
                               onChange={handleAdvRes}/>
                        <label className="form-check-label">Advanced Response</label>
                    </div>

                    {advReq && (
                        <>
                            <hr/>
                            <div className="input-group mb-3">
                                <span className="input-group-text text-bg-light">Method</span>
                                <select name="method" className="form-control" defaultValue={job.method}>
                                    <option>GET</option>
                                    <option>POST</option>
                                    <option>PUT</option>
                                    <option>PATCH</option>
                                    <option>DELETE</option>
                                    <option>HEAD</option>
                                    <option>OPTIONS</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label>Config for Axios (Options)</label>
                                <textarea name="options" defaultValue={JSON.stringify(job.options, null, 4)} cols="30"
                                          rows="10"
                                          className="form-control"></textarea>
                            </div>
                        </>
                    )}

                    {advRes && (
                        <>
                            <hr/>
                            <div className="mb-3">
                                <label>If response that</label>
                                <textarea name="response.check" defaultValue={job?.response?.check} cols="30" rows="5"
                                          className="form-control"></textarea>
                            </div>
                            <div className="input-group mb-3">
                                <span className="input-group-text text-bg-light">Set Interval</span>
                                <input type="number" name="response.interval" defaultValue={job?.response?.interval}
                                       className="form-control" min={0}/>
                            </div>
                        </>
                    )}

                    <button className="btn btn-primary" type={"submit"} disabled={!isClickable}>Submit</button>
                </form>
            )}
        </>
    )
}

export default JobForm