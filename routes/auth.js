const express = require("express");
const config = require("../config");
const router = express.Router();


router.get("/login", (req, res) => {
    if (req.session.loggedIn)
        return res.redirect("/");
    res.render("login");
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
});

router.post("/login", (req, res) => {
    if (req.body.password && req.body.password === config.env.PASSWORD) {
        req.session.loggedIn = true;
        return res.json({
            status: "success"
        });
    }
    res.status(401);
    res.json({
        status: "error"
    });
});

module.exports = router;
