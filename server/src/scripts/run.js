import axios from "axios";
import {cookieDict, cookieHeader, sleep, sleepMs, time} from "melperjs";

import socket from "../config/socket.js";
import * as mgr from "../utils/manager.js";


const cookieJar = {};

export default async () => {
    const io = socket.get();
    let cronData = null;
    let allCrons = {};
    let runningCrons = {};
    while (true) {
        try {
            allCrons = {};
            cronData = {};
            (await mgr.getAll(true)).forEach(cron => allCrons[cron.id] = true);
            for (const cronId in allCrons) {
                if (!(cronId in runningCrons)) {
                    runningCrons[cronId] =
                        cronFunc(cronId)
                            .then(() => {
                            })
                            .catch(() => {
                            });
                }
            }
        } catch (e) {
            if (e?.response?.status !== 400) {
                console.error("TEST:CRON:ERROR");
                console.error(e);
            }
        }
        await sleep(5);
    }


    async function cronFunc(cronId) {
        let cron;
        try {
            cron = await mgr.getById(cronId);
            if (cron.id) {
                let res, status;
                let timeout = cron.interval;
                const timeStart = Date.now();
                const domain = new URL(cron.url).host;
                cookieJar[domain] = cookieJar[domain] || {}

                try {
                    const client = axios.create({
                        timeout: 120000
                    })
                    client.interceptors.response.use(response => {
                        cookieJar[domain] = {...cookieJar[domain], ...cookieDict(response)};
                        return response;
                    }, error => {
                        cookieJar[domain] = {...cookieJar[domain], ...cookieDict(error.response)};
                        return Promise.reject(error);
                    });
                    cron.options.headers = cron.options.headers || {}
                    res = await client.request({
                        ...cron.options,
                        url: cron.url,
                        method: cron.method,
                        headers: {
                            ...cron.options.headers,
                            cookie: cookieHeader(cookieJar[domain])
                        }
                    });
                    status = res.status;
                } catch (e) {
                    res = e.response;
                    status = e.message
                }
                const timeElapsed = Date.now() - timeStart;
                const date = res?.headers?.date || "-";
                const completed = Math.max(0.01, (timeElapsed / 1000)).toFixed(2);
                const message = [
                    `Job: ${cron.name}`,
                    `Status: ${status}`,
                    `Completed: ${completed} secs`,
                    `Date: ${date}`,
                ].join(" | ");
                io.emit("watch", message);
                console.info(message);

                mgr.activity(cron.id).then(() => io.emit("time", {id: cron.id, time: time()}));

                if (res?.data && cron?.response?.check) {
                    if (typeof res.data !== "string")
                        res.data = JSON.stringify(res.data);
                    res.data = res.data.trim()
                    if (res.data === cron.response.check.trim())
                        timeout = cron.response.interval;
                }

                await sleepMs(Math.max(0, timeout * 1000 - timeElapsed));
            }
        } catch (e) {
            console.error("RUN", e)
            await sleepMs((cron.interval || 10) * 1000);
        }


        if (cronId in allCrons && cron?.id) {
            return await cronFunc(cronId);
        } else {
            delete runningCrons[cronId];
        }
    }
}