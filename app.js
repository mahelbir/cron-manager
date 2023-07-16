require('dotenv').config({override: true});
const fs = require("fs");
const path = require('path');
const express = require('express');
const app = express();
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const compression = require('compression');
const helmet = require('helmet');
const config = require("./config/index");
const router = require("./config/router");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// APPLICATION
if (!fs.existsSync(config.path.jobStorage))
    fs.mkdirSync(config.path.jobStorage, {recursive: true});
if (!fs.existsSync(config.session.path))
    fs.mkdirSync(config.session.path, {recursive: true});
if (config.session)
    app.use(session({
        name: ("SESSION_" + parseInt(process.env.PORT).toString(16)).toUpperCase(),
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: config.session.age * 1000
        },
        store: new FileStore({
            path: config.session.path,
            ttl: config.session.age
        })
    }));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
try {
    router(app);
} catch (err) {
    app.use(function (req, res, next) {
        next(err);
    });
}
app.locals.SOCKET_PORT = process.env.SOCKET;
app.locals.SOCKET_AUTH = Buffer.from(process.env.PASSWORD).toString('base64');
console.log("ENVIRONMENT: " + app.get('env'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    const error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500).send(`<h1>${err.message}</h1><h2>${error.status || 500}</h2><pre>${error.stack || ''}</pre>`);
});

module.exports = app;