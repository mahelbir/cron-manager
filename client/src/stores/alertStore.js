import {create} from "zustand"
import {omit} from  "lodash-es"

const useAlertStore = create((set, get) => ({
    alerts: {},
    enable: (name, message = null) => {
        set((state) => ({alerts: {...state.alerts, [name]: message}}))
    },
    disable: (name) => {
        set((state) => ({alerts: omit(state.alerts, name)}))
    },
    timer: (name, message = null, timeout = 2500) => {
        get().enable(name, message)
        setTimeout(() => get().disable(name), timeout)
    }
}))

export default useAlertStore