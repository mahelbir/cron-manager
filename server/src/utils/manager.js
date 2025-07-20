import path from "path";
import {randomUUID} from "crypto";
import {promises as fs} from "fs";

import config from "../config/config.js";
import {moment} from "../config/packages.js";


export function jobId(id) {
    id = id?.toString?.()?.trim?.();
    return (id && id?.length === 36) && id;
}

export async function activity(id) {
    try {
        const time = new Date();
        const file = path.join(config.path.jobs, id + ".json");
        await fs.utimes(file, time, time);
        return time.getTime();
    } catch (e) {
        console.error("MANAGER:activity");
        console.error(e);
        return 0;
    }
}

export async function remove(id) {
    try {
        const file = path.join(config.path.jobs, id + ".json");
        await fs.unlink(file);
        return true;
    } catch (e) {
        console.error("MANAGER:remove");
        console.error(e);
        return false;
    }
}

export async function getAll(status = null) {
    try {
        const jobs = [];
        const promises = [];
        const files = await fs.readdir(config.path.jobs);
        files.forEach(fileName => {
            const jobId = path.basename(fileName, path.extname(fileName));
            promises.push(
                getById(jobId)
                    .then(res => {
                        (status === null || status === res.status) && jobs.push(res)
                    })
                    .catch(() => {
                    })
            );
        });
        await Promise.all(promises);
        return jobs;
    } catch (e) {
        console.error("MANAGER:getAll");
        console.error(e);
        return [];
    }
}

export async function getById(id) {
    let data = {};
    const promises = [];
    const file = path.join(config.path.jobs, id + ".json");
    promises.push(
        fs.readFile(file)
            .then(res => res.toString())
            .then(res => JSON.parse(res))
            .then(res => {
                data = {...data, ...res}
            }));
    promises.push(
        fs.stat(file)
            .then(res => data.activity = moment(res.mtime).unix())
    );
    await Promise.all(promises);
    data.status = Boolean(data.status);
    return data;
}

export async function set(data, id = null) {
    id = id || randomUUID();
    const job = {
        id,
        "name": data.name,
        "interval": parseInt(data.interval) || 0,
        "concurrent": parseInt(data.concurrent) || 1,
        "status": Boolean(data.status ?? true),
        "url": data.url,
        "method": data.method || "GET",
        "options": data.options || {},
        "response": data.response || {"check": null, "interval": 0}
    };
    const file = path.join(config.path.jobs, id + ".json");
    const fileData = JSON.stringify(job);
    await fs.writeFile(file, fileData, 'utf-8');
    return job;
}

export async function modify(data, id) {
    let job = await getById(id);
    job = {...job, ...data};
    delete job.activity;
    const file = path.join(config.path.jobs, id + ".json");
    const fileData = JSON.stringify(job);
    await fs.writeFile(file, fileData, 'utf-8');
    return job;
}