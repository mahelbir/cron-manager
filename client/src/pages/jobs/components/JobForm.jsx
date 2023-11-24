import {Field, Form, Formik} from "formik";
import LoadableComponent from "../../../components/Loadable.jsx";
import {useEffect, useState} from "react";
import {apiRequest, sleepMs} from "../../../utils/helper.js";
import {useAutoAnimate} from "@formkit/auto-animate/react";
import Loading from "../../../components/Loading.jsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {cloneDeep} from "lodash-es";


const Alert = LoadableComponent("components/Alert")

const JobForm = ({job = {}, jobId}) => {

    const [animate] = useAutoAnimate()
    const [error, setError] = useState(null)
    const queryClient = useQueryClient()
    const [advReq, setAdvReq] = useState(false)
    const [advRes, setAdvRes] = useState(false)
    const initialValues = {
        name: '',
        interval: 60,
        url: '',
        method: 'GET',
        options: '{}',
        resCheck: '',
        resInterval: 30
    }

    useEffect(() => {
        if (job?.id) {
            initialValues.name = job.name
            initialValues.interval = job.interval
            initialValues.url = job.url
            initialValues.method = job.method.toUpperCase()
            initialValues.options = JSON.stringify(job.options, null, 4)
            initialValues.resCheck = job?.response?.check || initialValues.resCheck
            initialValues.resInterval = job?.response?.interval || initialValues.resInterval
            setAdvReq(Object.keys(job.options).length > 0 || job.method.toUpperCase() !== "GET")
            setAdvRes(!!job?.response?.check)
        }
    }, [job?.id]);

    const mutation = useMutation({
        mutationKey: ['JobDetails', jobId],
        mutationFn: async (data) => {
            return (await apiRequest(`jobs/${job.id || ''}`, {
                method: jobId ? "PUT" : "POST",
                data
            })).data
        }
    })
    const {isPending, isSuccess, failureReason, mutate} = mutation

    const handleAdvReq = () => setAdvReq(!advReq)

    const handleAdvRes = () => setAdvRes(!advRes)

    const handleForm = async (values, {setSubmitting}) => {
        let data = {
            name: values.name,
            url: values.url,
            interval: +values.interval,
            status: job?.status ?? true,
            method: values.method
        }
        if (values.resCheck) {
            data.response = {
                check: values.resCheck,
                interval: values.resInterval
            }
        }
        try {
            data.options = JSON.parse(values.options || "{}")
        } catch {
            data = null
            setError("Invalid JSON config!")
            setTimeout(() => setError(null), 2500)
        }
        ((!values.options || values.options === '{}') && values.method === "GET") && setAdvReq(false)
        !values.resCheck && setAdvRes(false)
        data && mutate(data, {
            onSuccess: (updatedData) => {
                setTimeout(() => mutation.reset(), 2500)
                jobId && queryClient.setQueryData(['JobDetails', jobId], () => updatedData)
            },
            onError: () => setTimeout(() => mutation.reset(), 2500)
        })
    }

    return (
        <>

            <Loading enabled={isPending}/>
            <Alert type="success" enabled={isSuccess}>Successful</Alert>
            <Alert type="error" enabled={!!failureReason || !!error}>
                {failureReason?.response?.data?.error || error || import.meta.env.VITE_ERROR}
            </Alert>

            {(!jobId || (jobId && job?.id)) && (
                <Formik initialValues={initialValues} onSubmit={handleForm}>
                    <Form autoComplete="off">
                        <fieldset disabled={isPending} ref={animate}>
                            <div className="input-group mb-3">
                                <span className="input-group-text text-bg-light">Name</span>
                                <Field type="text" name="name" className="form-control" required={true}/>
                            </div>
                            <div className="input-group mb-3">
                                <span className="input-group-text text-bg-light">Interval (seconds)</span>
                                <Field type="number" name="interval" className="form-control" min="0"
                                       required={true}/>
                            </div>
                            <div className="input-group mb-3">
                                <span className="input-group-text text-bg-light">Visit URL</span>
                                <Field type="url" name="url" className="form-control" min="0" required={true}/>
                            </div>
                            <div className="form-check mb-3">
                                <Field className="form-check-input" type="checkbox" id="advReq" checked={advReq}
                                       onChange={handleAdvReq}/>
                                <label className="form-check-label" htmlFor="advReq">Advanced Request</label>
                            </div>
                            {advReq && (
                                <>
                                    <hr/>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text text-bg-light">Method</span>
                                        <Field as="select" name="method" className="form-control">
                                            <option>GET</option>
                                            <option>POST</option>
                                            <option>PUT</option>
                                            <option>PATCH</option>
                                            <option>DELETE</option>
                                            <option>HEAD</option>
                                            <option>OPTIONS</option>
                                        </Field>
                                    </div>
                                    <div className="mb-3">
                                        <label>Config for Axios (Options)</label>
                                        <Field as="textarea" name="options" cols="30" rows="10"
                                               className="form-control"/>
                                    </div>
                                    <hr/>
                                </>
                            )}
                            <div className="form-check mb-3">
                                <Field className="form-check-input" type="checkbox" id="advRes" checked={advRes}
                                       onChange={handleAdvRes}/>
                                <label className="form-check-label" htmlFor="advRes">Advanced Response</label>
                            </div>
                            {advRes && (
                                <>
                                    <hr/>
                                    <div className="mb-3">
                                        <label>If that's response</label>
                                        <Field as="textarea" name="resCheck" cols="30" rows="5"
                                               className="form-control"/>
                                    </div>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text text-bg-light">Set Interval</span>
                                        <Field type="number" name="resInterval" className="form-control" min="0"/>
                                    </div>
                                </>
                            )}
                            <hr/>
                            <button className="btn btn-primary" type="submit">Submit</button>
                        </fieldset>
                    </Form>
                </Formik>
            )}
        </>
    )
}

export default JobForm