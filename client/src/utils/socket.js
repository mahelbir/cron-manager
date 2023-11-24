import {io} from 'socket.io-client';
import {baseURL} from "./helper.js";


export const initSocket = (authToken) => {
    if (!authToken)
        return null

    return io(baseURL, {
        transportOptions: {
            polling: {
                extraHeaders: {
                    authorization: "Bearer " + authToken
                }
            }
        }
    })
};

export const socketEffect = (socket, events = []) => {
    if (socket) {
        events.forEach(event => socket.on(event.name, event.on))
        return () => {
            events.forEach(event => socket.off(event.name))
        }
    }
}