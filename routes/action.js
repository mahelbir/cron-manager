const express = require("express");
const config = require("../config");
const helper = require("../utils/helper");
const path = require("path");
const fs = require("fs");
const router = express.Router();

router.post("/add", (req, res) => {
    return job(req, res);
});

router.post("/edit", (req, res) => {
    if (!req.body.id)
        return res.json({
            status: "error",
            "message": "Cron doesn't exist!"
        });
    fs.unlinkSync(path.join(config.path.writable, req.body.id));
    return job(req, res);
});

router.get("/delete", (req, res) => {
    try {
        if (req.query.id)
            fs.writeFileSync(path.join(config.path.writable, "change.cronjob"), "-");
        fs.unlinkSync(path.join(config.path.writable, req.query.id));
    } catch (err) {
    } finally {
        res.redirect("/");
    }
});

router.get("/status/:status", (req, res) => {
    try {
        fs.writeFileSync(path.join(config.path.writable, "change.cronjob"), "-");
        if (req.params.status === "enabled")
            fs.renameSync(path.join(config.path.writable, req.query.id), path.join(config.path.writable, req.query.id.replace(".disabled", ".enabled")));
        else
            fs.renameSync(path.join(config.path.writable, req.query.id), path.join(config.path.writable, req.query.id.replace(".enabled", ".disabled")));
    } catch (err) {
    } finally {
        res.redirect("/");
    }
});

/**
 * @param {Request} req
 * @param {Response} res
 */
function job(req, res) {
    let error = null;
    if (!req.body.name || !req.body.method || !req.body.link || !req.body.interval || parseInt(req.body.interval) < 0)
        error = "Fill all required fields!";
    else if (50 < req.body.name.length)
        error = "The name can contain up to 50 characters!";
    if (error)
        return res.json({
            status: "error",
            "message": error
        });
    let cron = {
        url: req.body.link,
        method: req.body.method,
        config: {},
        response: null,
        intervalRes: 0
    };
    if (req.body.advancedReq && req.body.config) {
        try {
            cron.config = JSON.parse(req.body.config);
        } catch (err) {
            console.log(err)
        }
    }
    if (req.body.response && req.body.intervalRes && parseInt(req.body.intervalRes) >= 0) {
        cron.response = req.body.response;
        cron.intervalRes = parseInt(req.body.intervalRes);
    }
    const fileName = helper.encodeJob(new Date().getTime(), req.body.interval, req.body.name);
    const filePath = path.join(config.path.writable, fileName + ".enabled");
    fs.writeFileSync(path.join(config.path.writable, "change.cronjob"), "-");
    fs.writeFile(filePath, JSON.stringify(cron), err => {
        if (err)
            return res.json({
                status: "error",
                "message": err.message
            });
        return res.json({
            status: "success",
            "message": "Successful!"
        });
    });
}

module.exports = router;
