const app = require('express');
const config = require('./');
const router = app.Router();


router.use("/auth", require(config.path.routes + 'auth'));
router.use("/", (req, res, next) => {
    if (req.session.loggedIn) return next();
    res.redirect("/auth/login");
});
router.use("/", require(config.path.routes + 'index'));
router.use("/edit", require(config.path.routes + 'edit'));
router.use("/watch", require(config.path.routes + 'watch'));
router.use("/action", require(config.path.routes + 'action'));

module.exports = router;