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
            (await mgr.getAll(true)).forEach(cron => {
                for (let i = 1; i <= cron.concurrent; i++) {
                    allCrons[cron.id + "_" + i] = cron.id;
                }
            });
            for (const cronKey in allCrons) {
                if (!(cronKey in runningCrons)) {
                    runningCrons[cronKey] =
                        cronFunc(cronKey, allCrons[cronKey])
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


    async function cronFunc(cronKey, cronId) {
        let cron;
        try {
            const cronIndex = +cronKey.split("_")[1];
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
                    `Job: ${cron.name} #${cronIndex}`,
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


        if (cronKey in allCrons && cron?.id) {
            return await cronFunc(cronKey, cronId);
        } else {
            delete runningCrons[cronKey];
        }
    }
}