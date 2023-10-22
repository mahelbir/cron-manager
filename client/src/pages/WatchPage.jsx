import {useContext, useEffect, useState} from "react";
import {socketEffect} from "../utils/socket.js";
import Alert from "../components/Alert.jsx";
import {SocketContext} from "../contexts/SocketContext.jsx";
import {LoadingContext} from "../contexts/LoadingContext.jsx";

const WatchPage = () => {

    const {socket, socketCheck, isSocketConnected, setIsSocketConnected} = useContext(SocketContext)
    const [events, setEvents] = useState([])


    useEffect(() => socketEffect(socket, [
        {
            name: "watch",
            on: value => setEvents(prev => [value, ...prev])
        }
    ], setIsSocketConnected), [socket]);

    return (
        <>
            {socketCheck && !isSocketConnected && <Alert type={"error"}>Socket is not connected!</Alert>}

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