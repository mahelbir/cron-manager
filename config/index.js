const path = require("path");

const root = path.join(__dirname, "../");
const config = {
    secret: process.env.SECRET,
    path: {
        root: root,
        storage: path.join(root, 'storage/')
    }
}

module.exports = config;