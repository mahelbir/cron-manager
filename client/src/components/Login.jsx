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

    // authenticate from query
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

    // get authentication methods
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

    // handle authentication methods
    useEffect(() => {
        if (!methodsQuery.isSuccess) return
        if (methodsQuery.data?.password) return
        if (methodsQuery.data?.sso?.redirect) {
            window.location.href = methodsQuery.data.sso.redirect
            return
        }
        if (methodsQuery.data?.anonymous) {
            anonymousMutation.mutate(undefined, {
                onSuccess: token => authLogin(token)
            })
        }
    }, [methodsQuery.data])

    // passthrough
    const anonymousMutation = useMutation({
        mutationKey: ['anonymous'],
        mutationFn: async () => {
            return (await apiRequest("auth/anonymous", {
                method: "POST"
            })).data.token
        }
    })

    const passwordMutation = useMutation({
        mutationKey: ['login'],
        mutationFn: async (password) => {
            return (await apiRequest("auth/login", {
                method: "POST",
                data: {password}
            })).data.token
        }
    })
    const initialValues = {password: ''}
    const handleForm = ({password}, {setFieldValue}) => {
        passwordMutation.mutate(password, {
            onSuccess: token => authLogin(token),
            onError: () => setTimeout(() => passwordMutation.reset(), 2500),
            onSettled: () => {
                setFieldValue('password', initialValues.password)
            }
        })
    }
    const isPending = passwordMutation.isPending || anonymousMutation.isPending || methodsQuery.isLoading || !tokenProcessed
    const failureReason = passwordMutation.failureReason || anonymousMutation.failureReason || methodsQuery.failureReason

    return (
        <div className="card-body">

            <Loading
                enabled={isPending}/>
            <Alert type="error" enabled={!!failureReason}>
                {failureMessage(failureReason)}
            </Alert>

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