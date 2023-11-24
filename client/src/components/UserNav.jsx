import {useEffect} from "react";
import {NavLink, Outlet} from "react-router-dom";
import useAuthStore from "../stores/authStore.js";
import useSocketStore from "../stores/socketStore.js";
import {initSocket, socketEffect} from "../utils/socket.js";


const UserNav = () => {

    const authToken = useAuthStore(state => state.authToken)
    const logout = useAuthStore(state => state.logout)
    const socket = useSocketStore(state => state.socket)
    const setSocket = useSocketStore(state => state.setSocket)
    const isSocketLoading = useSocketStore(state => state.isLoading)
    const endSocketLoading = useSocketStore(state => state.endLoading)
    const setSocketConnected = useSocketStore(state => state.setConnected)

    useEffect(() => {
        !socket?.connected && setSocket(initSocket(authToken))
    }, [authToken]);

    useEffect(() => socketEffect(socket, [
        {
            name: 'connect',
            on: () => {
                endSocketLoading()
                setSocketConnected(true)
            }
        },
        {
            name: 'disconnect',
            on: () => setSocketConnected(false)
        },
        {
            name: 'connect_error',
            on: () => {
                endSocketLoading()
                setSocketConnected(false)
            }
        }
    ]), [isSocketLoading]);

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
                <Outlet/>
            </div>
            <div className="card-footer d-flex justify-content-end">
                <button className="btn btn-secondary" onClick={logout}><i className="fas fa-sign-out"></i> Logout
                </button>
            </div>
        </>
    )
}

export default UserNav