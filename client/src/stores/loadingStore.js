import {create} from "zustand"
import {omit} from  "lodash-es"

const useLoadingStore = create((set, get) => ({
    loadings: {},
    enable: (name) => {
        set((state) => ({loadings: {...state.loadings, [name]: true}}))
    },
    disable: (name) => {
        set((state) => ({loadings: omit(state.loadings, name)}))
    },
    timer: (name, timeout = 2500) => {
        get().enable(name)
        setTimeout(() => get().disable(name), timeout)
    }
}))

export default useLoadingStore