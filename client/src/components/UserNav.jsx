import {useEffect} from "react";
import {NavLink, Outlet} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import useAuthStore from "../stores/authStore.js";
import useSocketStore from "../stores/socketStore.js";
import {initSocket, socketEffect} from "../utils/socket.js";
import {apiRequest} from "../utils/helper.js";


const UserNav = () => {

    const authToken = useAuthStore(state => state.authToken)
    const logout = useAuthStore(state => state.logout)
    const methodsQuery = useQuery({
        queryKey: ['methods'],
        queryFn: async () => (await apiRequest("auth/methods", {
            method: "POST",
            data: {state: window.location.pathname}
        })).data
    })
    const canLogout = methodsQuery.data && !methodsQuery.data.anonymous
    const socket = useSocketStore(state => state.socket)
    const setSocket = useSocketStore(state => state.setSocket)
    const isSocketLoading = useSocketStore(state => state.isLoading)
    const endSocketLoading = useSocketStore(state => state.endLoading)
    const setSocketConnected = useSocketStore(state => state.setConnected)

    useEffect(() => {
        const newSocket = initSocket(authToken)
        setSocket(newSocket)
        return () => {
            newSocket?.disconnect()
        }
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
            {canLogout && (
                <div className="card-footer d-flex justify-content-end">
                    <button className="btn btn-secondary" onClick={logout}><i className="fas fa-sign-out"></i> Logout
                    </button>
                </div>
            )}
        </>
    )
}

export default UserNav