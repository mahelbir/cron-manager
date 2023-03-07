const express = require("express");
const config = require("../config");
const router = express.Router();


router.get("/", (req, res) => {
    res.render("watch", {host: config.env.HOST, socket: config.env.SOCKET});
});

module.exports = router;
