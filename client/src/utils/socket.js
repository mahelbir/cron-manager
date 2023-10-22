import {io} from 'socket.io-client';
import {baseURL} from "./helper.js";
import {useEffect} from "react";


export const initSocket = (authToken) => {
    if (!authToken)
        return null

    return io(baseURL, {
        transportOptions: {
            polling: {
                extraHeaders: {
                    "x-auth": authToken
                }
            }
        }
    })
};

export const socketEffect = (socket, events = [], setIsConnected = null) => {
    if (socket) {
        if (typeof setIsConnected === "function") {
            setIsConnected(socket?.connected)
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
}