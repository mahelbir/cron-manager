const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const config = require("../config");
const {fetchJobs, decodeJob} = require("../utils/helper");

router.get("/", function (req, res, next) {
    try {
        const jobs = fetchJobs().map(file => {
            const stats = fs.statSync(path.join(config.path.jobStorage, file));
            const obj = decodeJob(file);
            obj.run = stats.mtimeMs;
            obj.file = file;
            return obj;
        });
        return res.render("index", {jobs: jobs});
    } catch (err) {
        next(err);
    }
});

module.exports = router;
