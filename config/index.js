const path = require("path");

const root = path.join(__dirname, "../");
const config = {
    env: process.env,
    path: {
        root: root,
        routes: path.join(root, 'routes/')
    }
}
module.exports = config;