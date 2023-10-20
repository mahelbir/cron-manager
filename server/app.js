import path from 'path';

import express from 'express';
import createError from 'http-errors';
import logger from 'morgan';
import helmet from 'helmet';
import cors from 'cors'
import compression from 'compression';
import timeout from 'express-timeout-handler';
import {createDir} from 'melperjs';

import config from './src/config/config.js';
import router from './src/config/router.js';


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
createDir(path.join(config.path.storage, "app"));
createDir(path.join(config.path.jobs));
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.set('trust proxy', true);
app.set('lang', app.locals.LANG);
app.set('serverIp', app.locals.SERVER_IP);
app.set('version', app.locals.VERSION);
router(app);
console.info("ENVIRONMENT: " + app.get('env'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return next(createError(404));
});

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