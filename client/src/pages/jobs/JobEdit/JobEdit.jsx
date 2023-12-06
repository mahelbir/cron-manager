import {apiRequest, failureMessage} from "../../../utils/helper.js";
import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import Loading from "../../../components/Loading.jsx";
import JobForm from "../components/JobForm.jsx";
import LoadableComponent from "../../../components/Loadable.jsx";


const Alert = LoadableComponent("components/Alert")

const JobEdit = () => {

    const {jobId} = useParams();
    const {isFetching, failureReason, data: job} = useQuery({
        queryKey: ['JobDetails', jobId],
        queryFn: async () => {
            const res = await apiRequest(`jobs/${jobId}`);
            if (!res?.data?.id)
                throw Error("Fetch error")
            return res.data
        }
    });

    return (
        <>
            <Loading enabled={isFetching}/>
            <Alert type="error" extra={failureReason} enabled={!!failureReason}>{failureMessage(failureReason)}</Alert>
            <JobForm job={job} jobId={jobId}></JobForm>
        </>
    )
}

export default JobEdit