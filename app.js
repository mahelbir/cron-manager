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
const sessionAge = 60 * 60 * 24 * 7;
app.use(session({
    name: "SESSION",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: sessionAge * 1000
    },
    store: new FileStore({
        path: path.join("storage", "sessions"),
        ttl: sessionAge
    })
}));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
router(app);
console.log("ENVIRONMENT: " + app.get('env'));
console.log("http://" + process.env.HOST + ":" + process.env.PORT);



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