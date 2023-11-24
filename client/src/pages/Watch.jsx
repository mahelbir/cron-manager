import {useEffect, useState} from "react";
import useSocketStore from "../stores/socketStore.js";
import {socketEffect} from "../utils/socket.js";
import LoadableComponent from "../components/Loadable.jsx";
import {useAutoAnimate} from "@formkit/auto-animate/react";

const Alert = LoadableComponent("components/Alert")

const Watch = () => {

    const [animate] = useAutoAnimate()
    const socket = useSocketStore(state => state.socket)
    const isSocketLoading = useSocketStore(state => state.isLoading)
    const isSocketConnected = useSocketStore(state => state.isConnected)
    const [logs, setLogs] = useState([])


    useEffect(() => socketEffect(socket, [
        {
            name: 'watch',
            on: text => setLogs(prev => [{text, id: prev.length}, ...prev])
        }
    ]), [isSocketLoading]);

    return (
        <>
            <Alert type="error" enabled={!isSocketLoading && !isSocketConnected}>Socket is not connected!</Alert>
                <ul className={"list-unstyled"} ref={animate}>
                    {
                        logs.map(log =>
                            <li key={log.id} className={"text-bg-light mb-1 px-1"}>{log.text}</li>
                        )
                    }
                </ul>
        </>
    )
}

export default Watch