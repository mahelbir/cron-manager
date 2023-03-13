const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const config = require("../config");
const helper = require("../utils/helper");

router.get("/", function (req, res, next) {
    try {
        const files = fs.readdirSync(config.path.storage);
        const pattern = /^\d+___\d+___.*\w+$/;
        const matchingFiles = files.filter(file => pattern.test(file));
        const jobs = matchingFiles.map(file => {
            const stats = fs.statSync(path.join(config.path.storage, file));
            const obj = helper.decodeJob(file);
            obj.run = stats.mtimeMs;
            obj.file = file;
            return obj;
        });
        res.render("index", {jobs: jobs, host: process.env.HOST, socket: process.env.SOCKET});
    } catch (err) {
        next(err);
    }
});

module.exports = router;
