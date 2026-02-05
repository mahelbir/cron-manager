import fs from 'fs';

import express from 'express';
import createError from 'http-errors';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors'
import timeout from 'express-timeout-handler';
import {getVersion, serverIp, tokenUuid} from 'melperjs/node';

import config from './src/config/config.js';
import scripter from './src/core/scripter.js';
import router from './src/core/router.js';
import packages from "./src/config/packages.js";
import models from "./src/models/models.js";
import hostingMiddleware from "./src/middlewares/hosting-middleware.js";


// system
const app = express();
app.use(timeout.handler({
    timeout: 120000,
    onTimeout: function (req, res) {
        return res.status(503).send('Request Timeout');
    }
}));
app.use((req, res, next) => {
    if (req.headers.accept) {
        req.acceptJSON = req.headers.accept.includes("application/json");
    }
    req.body = req.body || {};
    next();
});
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', parameterLimit: 50000, extended: true}));
app.use(express.static(config.path.static));


// application
await packages();
fs.mkdirSync(config.path.cache, {recursive: true});
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.locals.BUILD_HASH = tokenUuid(false);
app.locals.VERSION = getVersion();
app.locals.SERVER_IP = serverIp();
app.locals.BASE_URL = config.env.BASE_URL;
app.set('trust proxy', true);
app.set('serverIp', app.locals.SERVER_IP);
app.set('version', app.locals.VERSION);
app.set('baseURL', app.locals.BASE_URL);
app.set('buildHash', app.locals.BUILD_HASH);
await models(app);
await scripter(app);
await router(app);
console.info("ENVIRONMENT: " + app.get('env'));
console.info("VERSION: " + app.get('version'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    if (req.acceptJSON !== "application/json")
        return next();

    return next(createError(404));
}, hostingMiddleware);

// error handler
app.use(function (err, req, res) {
    try {
        const status = err.status || 500;
        const stack = req.app.get('env') === 'development' ? err.stack : '';
        return res
            .status(status)
            .send({
                error: err.message,
                stack: stack
            });
    } catch (e) {
        return res
            .status(500)
            .send({
                error: e.message || "System error"
            });
    }
});

export default app;