import {useContext} from "react";
import {NavLink, Outlet} from "react-router-dom";
import {AuthContext} from "../contexts/AuthContext.jsx";
import Loading from "./Loading.jsx";
import {LoadingContext} from "../contexts/LoadingContext.jsx";

const UserPanel = () => {

    const {dispatchAuth} = useContext(AuthContext)
    const {loadingIcon} = useContext(LoadingContext)

    const handleLogout = () => {
        dispatchAuth({type: "LOGOUT"})
    }

    return (
        <>
            <div className="card-header d-flex justify-content-end">
                <div className="btn-group">
                    <NavLink to="add" className="btn btn-secondary"><i
                        className="fas fa-plus"></i> New</NavLink>
                    <NavLink to="" className="btn btn-secondary"><i
                        className="fas fa-list"></i> Jobs</NavLink>
                    <NavLink to="watch" className="btn btn-secondary"><i
                        className="fas fa-eye"></i> Watch</NavLink>
                </div>
            </div>
            <div className="card-body">
                {loadingIcon && <Loading></Loading>}
                <Outlet/>
            </div>
            <div className="card-footer d-flex justify-content-end">
                <button className="btn btn-secondary" onClick={handleLogout}><i className="fas fa-sign-out"></i> Logout</button>
            </div>
        </>
    )
}

export default UserPanel