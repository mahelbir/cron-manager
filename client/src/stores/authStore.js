import {create} from 'zustand'

const useAuthStore = create((set, get) => ({
    authToken: localStorage.getItem("authToken") || null,
    login: (authToken) => {
        localStorage.setItem("authToken", authToken)
        set(() => ({authToken}))
    },
    logout: () => {
        localStorage.removeItem("authToken")
        set(() => ({authToken: null}))
    }
}))

export default useAuthStore