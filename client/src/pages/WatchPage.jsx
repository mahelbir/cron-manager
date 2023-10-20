import {useEffect, useState} from "react";
import socket, {socketEffect} from "../utils/socket.js";
import Alert from "../components/Alert.jsx";

const WatchPage = () => {

    const [isCheck, setIsCheck] = useState(false);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [events, setEvents] = useState([]);

    useEffect(() => socketEffect([
        {
            name: "watch",
            on: value => setEvents(prev => [value, ...prev])
        }
    ], setIsConnected), []);

    setTimeout(() => setIsCheck(true), 2500)

    return (
        <>
            {isCheck && !isConnected && <Alert type={"error"}>Socket is not connected!</Alert>}

            <ul className={"list-unstyled"}>
                {
                    events.map((event, index) =>
                        <li key={index} className={"text-bg-light mb-1 px-1"}>{event}</li>
                    )
                }
            </ul>
        </>
    )
}

export default WatchPage