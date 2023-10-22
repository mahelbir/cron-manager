import {useParams} from "react-router-dom";
import JobForm from "../../components/JobForm.jsx";
import {useContext, useEffect, useState} from "react";
import {apiRequest} from "../../utils/helper.js";
import {alertCall} from "../../components/Alert.jsx";
import {AuthContext} from "../../contexts/AuthContext.jsx";
import {LoadingContext} from "../../contexts/LoadingContext.jsx";

const JobEditPage = () => {

    const {dispatchAuth} = useContext(AuthContext)
    const {setLoadingIcon} = useContext(LoadingContext)
    const [message, setMessage] = useState(null)
    const [job, setJob] = useState({})
    const {jobId} = useParams();

    useEffect(() => {
        setLoadingIcon(true)
        apiRequest("jobs/" + jobId)
            .then(res => {
                setJob(res.data)
            })
            .catch(e => {
                e?.response?.status === 401 && dispatchAuth({type: "LOGOUT"})
                if (e?.response?.data?.error?.includes?.("Invalid ID"))
                    return setMessage(e.response.data.error)
                alertCall(import.meta.env.VITE_ERROR, setMessage)
            })
            .finally(() => setLoadingIcon(false))

        return () => {
            setJob({})
            setLoadingIcon(false)
        }
    }, []);

    return (
        <>
            <JobForm message={message} setMessage={setMessage} job={job} setJob={setJob} jobId={jobId}></JobForm>
        </>
    )
}

export default JobEditPage