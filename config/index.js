const path = require("path");

const root = path.join(__dirname, "../");
const config = {
    env: process.env,
    secret: process.env.SECRET,
    path: {
        root: root,
        routes: path.join(root, 'routes/'),
        writable: path.join(root, 'writable/')
    }
}
module.exports = config;