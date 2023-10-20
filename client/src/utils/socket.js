import {io} from 'socket.io-client';
import {baseURL} from "./helper.js";


const socket = io(baseURL, {
    transportOptions: {
        polling: {
            extraHeaders: {
                "x-auth": localStorage.getItem("authToken")
            }
        }
    }
});

export const socketEffect = (events = [], setIsConnected = null) => {

    if (typeof setIsConnected === "function") {
        events.push({
            name: 'connect',
            on: () => setIsConnected(true)
        })
        events.push({
            name: 'disconnect',
            on: () => setIsConnected(false)
        })
    }

    events.forEach(event => socket.on(event.name, event.on))

    return () => {
        events.forEach(event => socket.off(event.name, event.off || event.on))
    }
}

export default socket