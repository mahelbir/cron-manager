import path from "path";
import {rootPath} from "../core/core.js";

const pathConfig = {root: rootPath()};
pathConfig.source = path.join(pathConfig.root, "src/");
pathConfig.static = path.join(pathConfig.root, '../client/dist/');
pathConfig.storage = path.join(pathConfig.source, "storage/");
pathConfig.appStorage = path.join(pathConfig.storage, "app/");
pathConfig.cache = path.join(pathConfig.storage, "cache/");

export default {
    path: pathConfig,
    env: process.env,
    isDev: process.env.NODE_ENV !== "production",
};