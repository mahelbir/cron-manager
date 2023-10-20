import {createContext, useState} from "react";

export const LoadingContext = createContext(null)

const LoadingContextProvider = ({children}) => {

    const [loadingIcon, setLoadingIcon] = useState(false);

    return (
        <LoadingContext.Provider value={{loadingIcon, setLoadingIcon}}>
            {children}
        </LoadingContext.Provider>

    )
}

export default LoadingContextProvider