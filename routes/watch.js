const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
    return res.render("watch", {host: process.env.HOST, socket: process.env.SOCKET});
});

module.exports = router;
