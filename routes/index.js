const express = require("express");
const config = require("../config");
const helper = require("../utils/helper");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.get("/", function (req, res) {
    try {
        const files = fs.readdirSync(config.path.writable);
        const pattern = /^\d+___\d+___.*\w+$/;
        const matchingFiles = files.filter(file => pattern.test(file));
        const jobs = matchingFiles.map(file => {
            const stats = fs.statSync(path.join(config.path.writable, file));
            const obj = helper.decodeJob(file);
            obj.run = stats.mtimeMs;
            obj.file = file;
            return obj;
        });
        res.render("index", {jobs: jobs, host: config.env.HOST, socket: config.env.SOCKET});
    } catch (err) {
        res.render("error", err.message);
    }
});

module.exports = router;
