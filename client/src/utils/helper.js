import axios from "axios";

export const baseURL = (import.meta.env.DEV ? import.meta.env.VITE_DEV_API : '');

export const apiRequest = async (endpoint = null, config = {}) => {
    config.headers = config.headers || {}

    const authToken = localStorage.getItem("authToken")
    if (authToken) config.headers["x-auth"] = authToken

    return await axios.request({
        ...config,
        baseURL: baseURL + "/api",
        url: endpoint,
        method: config.method || "GET",
        timeout: 120000
    });
}