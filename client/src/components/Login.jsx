import LoadableComponent from "./Loadable.jsx";
import Loading from "./Loading.jsx";
import {Formik, Form, Field} from "formik";
import {apiRequest, failureMessage} from "../utils/helper.js";
import {useMutation} from "@tanstack/react-query";
import useAuthStore from "../stores/authStore.js";


const Alert = LoadableComponent("components/Alert")

const Login = () => {

    const authLogin = useAuthStore(state => state.login)
    const mutation = useMutation({
        mutationKey: ['login'],
        mutationFn: async (password) => {
            return (await apiRequest("auth/login", {
                method: "POST",
                data: {password}
            })).data.token
        }
    })
    const {isPending, error, failureReason, mutate} = mutation
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

            <Loading enabled={isPending}/>
            <Alert type="error" enabled={!!failureReason}>
                {failureMessage(failureReason)}
            </Alert>

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
        </div>
    )
}

export default Login