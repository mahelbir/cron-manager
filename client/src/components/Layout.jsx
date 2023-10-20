import Login from "./Login.jsx";
import {AuthContext} from "../contexts/authContext.jsx";
import {useContext} from "react";
import UserPanel from "./UserPanel.jsx";


const Layout = () => {

    const {loggedIn} = useContext(AuthContext);

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="container my-5">
                <h1 className="d-flex justify-content-center mb-5">Cron Job Manager</h1>
                <div className="card">
                    {loggedIn ?
                        <UserPanel></UserPanel>
                        :
                        <Login></Login>
                    }
                </div>
            </div>
        </div>
    )
}

export default Layout