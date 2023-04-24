require('dotenv').config({override: true});
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const compression = require('compression');
const helmet = require('helmet');
const config = require("./config/index");
const router = require("./config/router");
const fs = require("fs");
const {changeJob} = require("./utils/helper");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// APPLICATION
if (!fs.existsSync(config.path.jobs))
    fs.mkdirSync(config.path.jobs, {recursive: true});
if (!fs.existsSync(config.session.path))
    fs.mkdirSync(config.session.path, {recursive: true});
if (config.session)
    app.use(session({
        name: ("SESSION_" + parseInt(process.env.PORT).toString(16)).toUpperCase(),
        secret: config.secret,
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
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;