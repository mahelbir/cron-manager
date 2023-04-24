require('dotenv').config();
const config = require("./config");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const tough = require('tough-cookie');
const socketio = require('socket.io');
const {decodeJob, fetchJobs} = require("./utils/helper");

console.log("Cron server started...");
io = new socketio.Server(process.env.SOCKET, {
    cors: {
        origin: "*",
        methods: ["GET"]
    }
});
io.use((socket, next) => {
    if (socket.handshake.headers['x-auth'] === Buffer.from(process.env.PASSWORD).toString('base64'))
        next();
    else
        next(new Error('not authorized'));
}).on('connection', (socket) => {
    console.log('SOCKET | client connected: ' + socket.id);
    socket.on('disconnect', () => {
        console.log('SOCKET | client disconnected: ' + socket.id);
    });
});
console.log("Socket server listening on " + process.env.SOCKET);


const cookieJar = new tough.CookieJar(true);
fs.readdir(config.path.jobs, async (err, files) => {
    if (!files || files.length < 1)
        return;
    const pattern = /^[a-zA-Z0-9- ]+___\d+___\d+\.enabled$/;
    const matchingFiles = files.filter((file) => pattern.test(file));
    for (let file of matchingFiles) {
        const job = decodeJob(file);
        file = path.join(config.path.jobs, file);
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
        io.emit("console", message);
        console.log(message);
        let timeout = job.interval;
        if (res.data != null && res.data === cron.response)
            timeout = cron.intervalRes;
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
        io.emit("console", message);
        console.log(message);
        let timeout = job.interval;
        if (err.response && err.response.data != null && err.response.data === cron.response)
            timeout = cron.intervalRes;
        setTimeout(() => {
            execute(file, job, cron);
        }, Math.max(0, timeout * 1000 - cost));
    }).finally(() => {
        const time = new Date();
        fs.utimes(file, time, time, () => {
            io.emit("time", {file: path.basename(file), time: time.getTime()});
        });
    });
}




