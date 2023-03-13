const fs = require("fs");
const path = require("path");
const config = require("../config");

function decodeJob(text) {
    const parts = text.split("___");
    return {
        id: encodeURIComponent(text),
        time: parseInt(parts[0]),
        interval: parseInt(parts[1]),
        name: parts[2].replace(".disabled", "").replace(".enabled", ""),
        enabled: parts[2].endsWith(".enabled")
    }
}

function encodeJob(time, interval, name) {
    return time.toString() + "___" + interval + "___" + name.replace(/[^a-zA-Z0-9\s-]/gi, "");
}

function changeJob(){
    fs.writeFileSync(path.join(config.path.storage, "change.cronjob"), "-");
}

module.exports = {
    decodeJob,
    encodeJob,
    changeJob
};