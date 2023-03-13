module.exports = (req, res, next) => {
    if (!req.session.loggedIn)
        return res.redirect("/auth/login/?returnUrl=" + req.originalUrl);
    res.locals.loggedIn = req.session.loggedIn;
    next();
}