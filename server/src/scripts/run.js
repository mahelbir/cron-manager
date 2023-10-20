import axios from "axios";
import {sleep, sleepMs, time} from "melperjs";

import socket from "../config/socket.js";
import * as mgr from "../utils/manager.js";


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
                let timeElapsed, res, status;
                let timeout = cron.interval;
                const timeStart = Date.now();

                try {
                    res = await axios.request({
                        ...cron.options,
                        url: cron.url,
                        method: cron.method,
                        timeout: 120000
                    });
                    status = res.status;
                    timeElapsed = Date.now() - timeStart;
                } catch (e) {
                    res = e.response;
                    status = e.message
                    timeElapsed = Date.now() - timeStart;
                }

                const date = res?.headers?.date || "-";
                const completed = (timeElapsed / 1000).toFixed(2);
                const message = [
                    `Job: ${cron.name}`,
                    `Status: ${status}`,
                    `Completed: ${completed} secs`,
                    `Date: ${date}`,
                ].join(" | ");
                io.emit("watch", message);
                console.info(message);

                mgr.activity(cron.id).then(res => io.emit("time", {id: cron.id, time: time()}));

                if (res.data && cron?.response?.check) {
                    if (typeof res.data !== "string")
                        res.data = JSON.stringify(res.data)
                    res.data = res.data.trim()
                    if (res.data === cron.response.check.trim())
                        timeout = cron.response.interval;
                }

                await sleepMs(Math.max(0, timeout * 1000 - timeElapsed));
            }
        } catch {
        }


        if (cronId in allCrons && cron?.id) {
            return await cronFunc(cronId);
        } else {
            cron.name && io.emit("watch", `Job: ${cron.name} | Status: Disabled`);
            delete runningCrons[cronId];
        }
    }
}