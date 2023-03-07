const express = require("express");
const config = require("../config");
const fs = require("fs");
const path = require("path");
const {decodeJob} = require("../utils/helper");
const router = express.Router();


router.get("/", (req, res) => {
    if (!req.query.id)
        res.redirect("/");
    try {
        fs.readFile(path.join(config.path.root, "writable", req.query.id), (err, url) => {
            if (err)
                return res.redirect("/");
            url = url.toString();
            res.render("edit", {id: req.query.id, link: url, job: decodeJob(req.query.id)});
        });
    } catch (err) {
        res.redirect("/");
    }
});

module.exports = router;
