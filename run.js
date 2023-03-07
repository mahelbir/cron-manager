const config = require("./config");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const tough = require('tough-cookie');
const {decodeJob} = require("./utils/helper");
const writable = path.join(config.path.root, "writable");
require('dotenv').config();

const socket = require('socket.io')(process.env.SOCKET, {
    cors: {
        origin: '*',
        methods: ['GET']
    }
});

socket.on('connection', (socket) => {
    console.log('SOCKET | client connected: ' + socket.id);
    socket.on('disconnect', () => {
        console.log('SOCKET | client disconnected: ' + socket.id);
    });
});


fs.readdir(writable, async (err, files) => {
    if(!files || files.length < 1)
        return;
    const pattern = /^\d+___\d+___.*\.enabled$/;
    const matchingFiles = files.filter((file) => pattern.test(file));
    for (let file of matchingFiles) {
        const job = decodeJob(file);
        file = path.join(writable, file);
        fs.readFile(file, (err, url) => {
            if (err) {
                console.error('Error reading file:', file, err);
                return;
            }
            url = url.toString();
            setInterval(() => {
                execute(file, url, job.name);
            }, job.interval * 1000);
        });
    }
});

const cookieJar = new tough.CookieJar(true);
const instance = axios.create({
    withCredentials: true,
    jar: cookieJar
});

function execute(file, url, name) {
    const timeBefore = Date.now();
    instance.get(url).then(res => {
        let date = "?";
        if (typeof res.headers.date !== 'undefined')
            date = res.headers.date;
        const message =
            "Job: " + name + "  " +
            "Status: " + res.status + "  " +
            "Completed: " + ((new Date() - timeBefore) / 1000).toFixed(2) + ' secs' + "  " +
            "Date: " + date;
        socket.emit("console", message);
        console.log(message);
    }).catch(err => {
        const message =
            "Job: " + name + "  " +
            "Status: " + err.message + "  " +
            "Completed: " + ((new Date() - timeBefore) / 1000).toFixed(2) + ' secs' + "  " +
            "Date: " + "?";
        socket.emit("console", message);
        console.log(message);
    }).finally(() => {
        const time = new Date();
        fs.utimes(file, time, time, () => {
            socket.emit("time", {file: path.basename(file), time: time.getTime()});
        });
    });
}




