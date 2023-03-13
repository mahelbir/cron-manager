const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
    if (req.session.loggedIn)
        return res.redirect("/");
    res.render("login", {"redirect": req.query.returnUrl || "/"});
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
});

router.post("/login", (req, res) => {
    if (req.body.password && req.body.password === process.env.PASSWORD) {
        req.session.loggedIn = true;
        return res.json({
            status: "success"
        });
    }
    res.status(401).json({
        status: "error"
    });
});

module.exports = router;
