import {create} from 'zustand'

const useSocketStore = create((set) => ({
    socket: null,
    isLoading: false,
    isConnected: false,
    setSocket: (socket) => set({socket, isLoading: true, isConnected: false}),
    endLoading: () => set({isLoading: false}),
    setConnected: (isConnected) => set({isConnected})
}));

export default useSocketStore