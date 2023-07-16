const fs = require("fs");
const path = require("path");
const config = require("../config");

function decodeJob(text) {
    const parts = text.split("___");
    return {
        id: encodeURIComponent(text),
        time: parseInt(parts[2].substring(0, 13)),
        interval: parseInt(parts[1]),
        name: parts[0],
        enabled: text.endsWith(".enabled")
    }
}

function encodeJob(time, interval, name) {
    return name.replace(/[^a-zA-Z0-9\s-]/gi, "") + "___" + interval + "___" + time.toString();
}

function changeJob() {
    fs.writeFileSync(path.join(config.path.jobStorage, "change.cronjob"), "1");
}

function fetchJobs(){
    const files = fs.readdirSync(config.path.jobStorage);
    const pattern = /^[a-zA-Z0-9- ]+___\d+___\d+\.(?:enabled|disabled)$/;
    return files.filter(file => pattern.test(file));
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}


module.exports = {
    decodeJob,
    encodeJob,
    changeJob,
    fetchJobs,
    sleep
};