const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const config = require("../config");
const {decodeJob} = require("../utils/helper");


router.get("/", (req, res) => {
    if (!req.query.id)
        return res.redirect("/");
    try {
        fs.readFile(path.join(config.path.jobStorage, req.query.id), (err, json) => {
            if (err)
                return res.redirect("/");
            const cron = JSON.parse(json.toString());
            const config = JSON.stringify(cron.config)
            return res.render("edit", {
                id: req.query.id,
                cron: cron,
                job: decodeJob(req.query.id),
                config: config,
                advancedReq: config !== '{}' || cron.method !== "GET",
                advancedRes: cron.response != null
            });
        });
    } catch (err) {
        return res.redirect("/");
    }
});

module.exports = router;
