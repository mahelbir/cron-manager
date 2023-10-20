import {useContext, useRef, useState} from "react";
import {AuthContext} from "../contexts/AuthContext.jsx";
import Alert, {alertCall} from "./Alert.jsx";
import {apiRequest} from "../utils/helper.js";
import Loading from "./Loading.jsx";
import {LoadingContext} from "../contexts/LoadingContext.jsx";

const Login = () => {

    const {dispatchAuth} = useContext(AuthContext)
    const {loadingIcon} = useContext(LoadingContext)
    const [error, setError] = useState(null)
    const passwordInput = useRef()

    const handle = (ev) => {
        ev.preventDefault()

        const password = passwordInput.current.value
        apiRequest("auth/login", {
            method: "POST",
            data: {password}
        })
            .then(res => {
                dispatchAuth({
                    type: "LOGIN",
                    authToken: res.data.token
                })
            })
            .catch(e => {
                alertCall(e?.response?.data?.error || e.message, setError, passwordInput)
            })
    }

    return (
        <div className="card-body">

            {loadingIcon && <Loading></Loading>}

            <form onSubmit={handle}>
                {error && <Alert type="error">{error}</Alert>}
                <div className="mb-3">
                    <input type="password" name="password" className="form-control" placeholder="Password"
                           ref={passwordInput} required={true} autoFocus={true}/>
                </div>
                <div className="text-center">
                    <button className="btn btn-primary" type="submit"><i className="fas fa-sign-in"></i> Login</button>
                </div>
            </form>
        </div>
    )
}

export default Login