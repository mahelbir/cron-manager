const path = require("path");

const dir = {root: path.join(__dirname, "../")};
dir.storage = path.join(dir.root, "storage");
dir.appStorage = path.join(dir.storage, "app/");
dir.jobStorage = path.join(dir.storage, "jobs/");

const config = {
    session: {
        path: path.join(dir.storage, "app/sessions/"),
        age: 86400
    },
    path: dir
}

module.exports = config;