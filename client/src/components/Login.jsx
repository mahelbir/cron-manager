import LoadableComponent from "./Loadable.jsx";
import Loading from "./Loading.jsx";
import {Formik, Form, Field} from "formik";
import {apiRequest, failureMessage} from "../utils/helper.js";
import {useMutation, useQuery} from "@tanstack/react-query";
import useAuthStore from "../stores/authStore.js";
import {useEffect, useState} from "react";


const Alert = LoadableComponent("components/Alert")

const Login = () => {

    const authLogin = useAuthStore(state => state.login)
    const [tokenProcessed, setTokenProcessed] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const authToken = params.get("authToken")
        if (authToken) {
            params.delete("authToken")
            const newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "")
            window.history.replaceState({}, "", newUrl)
            authLogin(authToken)
        }
        setTokenProcessed(true)
    }, [window.location.search])

    const methodsQuery = useQuery({
        queryKey: ['methods'],
        queryFn: async () => {
            return (await apiRequest("auth/methods", {
                method: "POST",
                data: {
                    state: window.location.href
                }
            })).data
        },
        enabled: tokenProcessed
    })

    useEffect(() => {
        if (methodsQuery.data?.sso?.redirect) {
            window.location.href = methodsQuery.data.sso.redirect
        }
    }, [methodsQuery.data])

    const mutation = useMutation({
        mutationKey: ['login'],
        mutationFn: async (password) => {
            return (await apiRequest("auth/login", {
                method: "POST",
                data: {password}
            })).data.token
        }
    })
    const {isPending, failureReason, mutate} = mutation
    const initialValues = {password: ''}

    const handleForm = ({password}, {setFieldValue}) => {
        mutate(password, {
            onSuccess: token => authLogin(token),
            onError: () => setTimeout(() => mutation.reset(), 2500),
            onSettled: () => {
                setFieldValue('password', initialValues.password)
            }
        })
    }

    return (
        <div className="card-body">

            <Loading enabled={isPending || methodsQuery.isLoading || !tokenProcessed}/>
            <Alert type="error" enabled={!!failureReason}>
                {failureMessage(failureReason)}
            </Alert>

            {methodsQuery.isSuccess && !methodsQuery.data?.sso?.redirect && !methodsQuery.data?.password && (
                <Alert type="error" enabled={true}>
                    Login disabled
                </Alert>
            )}

            {methodsQuery.isSuccess && methodsQuery.data?.password && (
                <Formik initialValues={initialValues} onSubmit={handleForm}>
                    <Form>
                        <fieldset disabled={isPending}>
                            <div className="mb-3">
                                <Field type={"password"} name={"password"} placeholder={"Password"}
                                       className={"form-control"} required={true} autoFocus={true}></Field>
                            </div>
                            <div className="text-center">
                                <button className="btn btn-primary" type="submit">
                                    <i className="fas fa-sign-in"></i> Login
                                </button>
                            </div>
                        </fieldset>
                    </Form>
                </Formik>
            )}
        </div>
    )
}

export default Login