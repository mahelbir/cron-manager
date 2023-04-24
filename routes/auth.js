const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
    if (req.session.loggedIn)
        return res.redirect("/");
    if (req.query.password && req.query.password === process.env.PASSWORD) {
        req.session.loggedIn = true;
        return res.redirect("/");
    }
    return res.render("login", {"redirect": req.query.returnUrl || "/"});
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login')
    })
});

router.post("/login", (req, res) => {
    if (req.body.password && req.body.password === process.env.PASSWORD) {
        req.session.loggedIn = true;
        return res.send({
            status: "success"
        });
    }
    return res.status(401).send({
        status: "error"
    });
});

module.exports = router;
