import {createContext, useContext, useEffect, useState} from "react";
import {initSocket} from "../utils/socket.js";
import {AuthContext} from "./AuthContext.jsx";

export const SocketContext = createContext(null)

const SocketContextProvider = ({children}) => {

    const {loggedIn} = useContext(AuthContext);
    const [socket, setSocket] = useState(null)
    const [socketCheck, setSocketCheck] = useState(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);

    useEffect(() => {
        setSocket(initSocket(loggedIn))
        setTimeout(() => setSocketCheck(true), 2500)
    }, [loggedIn]);

    return (
        <SocketContext.Provider value={{socket, socketCheck, isSocketConnected, setIsSocketConnected}}>
            {children}
        </SocketContext.Provider>

    )
}

export default SocketContextProvider