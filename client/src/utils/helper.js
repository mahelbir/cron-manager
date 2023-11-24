import axios from "axios";
import useAuthStore from "../stores/authStore.js";

export const baseURL = (import.meta.env.DEV ? import.meta.env.VITE_DEV_API : '');

export const apiRequest = async (endpoint = null, config = {}) => {
    config.headers = config.headers || {}

    const authToken = useAuthStore.getState().authToken
    if (authToken) config.headers.authorization = "Bearer " + authToken

    config.headers["content-type"] = config.headers["content-type"] || "application/json"
    config.headers["accept"] = config.headers["accept"] || "application/json"

    try {
        return await axios.request({
            ...config,
            baseURL: baseURL + "/api",
            url: endpoint,
            method: config.method || "GET",
            timeout: 60000
        });
    } catch (e) {
        e?.response?.status === 401 && useAuthStore.getState().logout()
        throw e;
    }
}

export const sleepMs = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}