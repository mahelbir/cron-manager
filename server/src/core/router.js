import path from "path";

import express from "express";

import globalMiddleware from "../middlewares/global-middleware.js";
import {importAll} from "./core.js";
import config from "../config/config.js";


let app = null;
let routers = [];

export async function newRoute(path, middlewares = []) {
    const router = express.Router();
    middlewares.forEach(middleware => {
        router.use(middleware);
    });
    routers.push({ path, router });
    return router;
}

function sortRoutersBySpecificity(routers) {
    return routers.sort((a, b) => {
        const pathA = a.path;
        const pathB = b.path;

        const wildcardCountA = (pathA.match(/\*/g) || []).length;
        const wildcardCountB = (pathB.match(/\*/g) || []).length;
        if (wildcardCountA !== wildcardCountB) {
            return wildcardCountA - wildcardCountB;
        }

        const paramCountA = (pathA.match(/:/g) || []).length;
        const paramCountB = (pathB.match(/:/g) || []).length;
        if (paramCountA !== paramCountB) {
            return paramCountA - paramCountB;
        }

        const segmentCountA = pathA.split('/').filter(s => s).length;
        const segmentCountB = pathB.split('/').filter(s => s).length;
        return segmentCountB - segmentCountA;
    });
}


export default async (appInstance) => {
    app = appInstance;
    app.use(globalMiddleware);
    const routesPath = path.posix.join(config.path.source, 'routes/**/*.js');
    await importAll(routesPath);
    const sortedRouters = sortRoutersBySpecificity(routers);
    sortedRouters.forEach(({path, router}) => {
        app.use(path, router);
    });
    routers = [];
};