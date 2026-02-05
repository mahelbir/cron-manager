import {create} from 'zustand'
import {baseURL} from "../utils/helper.js";

const useAuthStore = create((set) => ({
    authToken: localStorage.getItem("authToken") || null,
    login: (authToken) => {
        localStorage.setItem("authToken", authToken)
        set(() => ({authToken}))
    },
    logout: () => {
        localStorage.removeItem("authToken")
        window.location.href = baseURL + "/api/auth/logout"
    }
}))

export default useAuthStore