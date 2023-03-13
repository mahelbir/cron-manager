const path = require("path");
const config = require("./");

function route(route) {
    return path.join(config.path.root, "routes/") + route;
}

function middleware(middleware) {
    return path.join(config.path.root, "middlewares/") + middleware;
}

module.exports = app => {

    app.use("/auth", require(route("auth")));

    app.use(require(middleware("auth")));

    app.use("/", require(route("index")));
    app.use("/edit", require(route("edit")));
    app.use("/watch", require(route("watch")));
    app.use("/action", require(route("action")));

};