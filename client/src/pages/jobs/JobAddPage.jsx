import JobForm from "../../components/JobForm.jsx";
import {useState} from "react";

const JobAddPage = () => {

    const [message, setMessage] = useState(null)
    const [job, setJob] = useState({})

    return (
        <>
            <JobForm message={message} setMessage={setMessage} job={job} setJob={setJob} jobId={""}></JobForm>
        </>
    )
}

export default JobAddPage