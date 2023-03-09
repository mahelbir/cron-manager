const config = require("./config");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const tough = require('tough-cookie');
const {decodeJob} = require("./utils/helper");
const {response} = require("express");
require('dotenv').config();

const socket = require('socket.io')(process.env.SOCKET, {
    cors: {
        origin: "http://" + process.env.HOST + ":" + process.env.PORT,
        methods: ['GET']
    }
});

socket.on('connection', (socket) => {
    console.log('SOCKET | client connected: ' + socket.id);
    socket.on('disconnect', () => {
        console.log('SOCKET | client disconnected: ' + socket.id);
    });
});


fs.readdir(config.path.writable, async (err, files) => {
    if (!files || files.length < 1)
        return;
    const pattern = /^\d+___\d+___.*\.enabled$/;
    const matchingFiles = files.filter((file) => pattern.test(file));
    for (let file of matchingFiles) {
        const job = decodeJob(file);
        file = path.join(config.path.writable, file);
        fs.readFile(file, (err, json) => {
            if (err) {
                console.error('Error reading file:', file, err);
                return;
            }
            fs.stat(file, (err, stats) => {
                if (err) {
                    console.error('Error stats:', file, err);
                    return;
                }
                setTimeout(() => {
                    execute(file, job, JSON.parse(json.toString()));
                }, Math.max(0, stats.mtimeMs + job.interval * 1000 - new Date()));
            });
        });
    }
});

const cookieJar = new tough.CookieJar(true);

function execute(file, job, cron) {
    const timeBefore = Date.now();
    axios({
        ...cron.config,
        ...{
            method: cron.method,
            url: cron.url,
            timeout: 90000,
            withCredentials: true,
            jar: cookieJar
        }
    }).then(res => {
        let date = "?";
        const cost = new Date() - timeBefore;
        if (typeof res.headers.date !== 'undefined')
            date = res.headers.date;
        const message =
            "Job: " + job.name + " | " +
            "Status: " + res.status + " | " +
            "Completed: " + (cost / 1000).toFixed(2) + ' secs' + " | " +
            "Date: " + date;
        socket.emit("console", message);
        console.log(message);
        let timeout = job.interval
        if (res.data != null && res.data === cron.response)
            timeout = cron.intervalRes
        setTimeout(() => {
            execute(file, job, cron);
        }, Math.max(0, timeout * 1000 - cost));
    }).catch(err => {
        const cost = new Date() - timeBefore;
        const message =
            "Job: " + job.name + " | " +
            "Status: " + err.message + " | " +
            "Completed: " + (cost / 1000).toFixed(2) + ' secs' + " | " +
            "Date: ?";
        socket.emit("console", message);
        console.log(message);
        let timeout = job.interval
        if (err.response && err.response.data != null && err.response.data === cron.response)
            timeout = cron.intervalRes
        setTimeout(() => {
            execute(file, job, cron);
        }, Math.max(0, timeout * 1000 - cost));
    }).finally(() => {
        const time = new Date();
        fs.utimes(file, time, time, () => {
            socket.emit("time", {file: path.basename(file), time: time.getTime()});
        });
    });
}




