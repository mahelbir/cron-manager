import {createContext, useReducer} from "react";
import AuthReducer from "../reducers/AuthReducer.jsx";

export const AuthContext = createContext(null);


export const AuthContextProvider = ({children}) => {

    const [loggedIn, dispatchAuth] = useReducer(AuthReducer, localStorage.getItem("authToken"));

    return (
        <AuthContext.Provider value={{loggedIn, dispatchAuth}}>
            {children}
        </AuthContext.Provider>

    )
}

export default AuthContextProvider