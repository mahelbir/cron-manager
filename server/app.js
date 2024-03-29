import * as fs from 'fs';
import path from 'path';

import express from 'express';
import createError from 'http-errors';
import logger from 'morgan';
import helmet from 'helmet';
import cors from 'cors'
import compression from 'compression';
import timeout from 'express-timeout-handler';

import config from './src/config/config.js';
import router from './src/config/router.js';
import react from './src/middlewares/react.js';


// system
const app = express();
app.use(express.static(config.path.static));
app.use(timeout.handler({
    timeout: 120000,
    onTimeout: function (req, res) {
        return res.status(408).json({"error": "Request timeout"});
    }
}));
app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', parameterLimit: 50000, extended: true}));


// application
fs.mkdirSync(path.join(config.path.storage, "app"), {recursive: true});
fs.mkdirSync(path.join(config.path.jobs), {recursive: true});
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.set('trust proxy', true);
router(app);
console.info("ENVIRONMENT: " + app.get('env'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    if (req.header("accept") !== "application/json")
        return next();

    return next(createError(404));
}, react);

// error handler
app.use(function (err, req, res, next) {
    try {
        const status = !isNaN(err.status) ? err.status : 500;
        const stack = req.app.get('env') === 'development' ? err.stack : {};
        return res.status(status).json({
            error: err.message,
            ...stack
        });
    } catch {
        return res.status(500).json({error: "Something went wrong"});
    }
});

export default app;