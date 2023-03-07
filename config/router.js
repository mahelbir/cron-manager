const app = require('express');
const config = require('./');
const router = app.Router();

router.use("/edit", require(config.path.routes + 'edit'));
router.use("/watch", require(config.path.routes + 'watch'));
router.use("/action", require(config.path.routes + 'action'));
router.use("/", require(config.path.routes + 'index'));

module.exports = router;