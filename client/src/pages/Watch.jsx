import {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
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
    const [searchParams] = useSearchParams()
    const jobIdParam = searchParams.get('jobId')
    const filterJobId = jobIdParam ? Number(jobIdParam) : null


    useEffect(() => socketEffect(socket, [
        {
            name: 'watch',
            on: payload => {
                const {jobId, message} = typeof payload === 'string' ? {message: payload} : (payload || {})
                if (filterJobId !== null && jobId !== filterJobId) return
                setLogs(prev => [{text: message, id: prev.length, time: new Date().toLocaleTimeString()}, ...prev])
            }
        }
    ]), [isSocketLoading, filterJobId]);

    return (
        <>
            <Alert type="error" enabled={!isSocketLoading && !isSocketConnected}>Socket is not connected!</Alert>
                <ul className={"list-unstyled"} ref={animate}>
                    {
                        logs.map(log =>
                            <li key={log.id} className={"text-bg-light mb-1 px-1"}>[{log.time}] {log.text}</li>
                        )
                    }
                </ul>
        </>
    )
}

export default Watch