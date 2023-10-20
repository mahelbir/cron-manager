import express from 'express';

import globalMiddleware from '../middlewares/global.js';
import jwtMiddleware from '../middlewares/jwt.js';

import indexRoute from "../routes/index.js";
import authRoute from "../routes/auth.js";
import jobsRoute from "../routes/jobs.js";

export default app => {

    // Global middleware
    app.use(globalMiddleware);

    // General
    app.use("/", indexRoute);


    // API
    const api = express.Router();
    app.use("/api", api)
        // Auth
        const auth = express.Router();
        api.use('/auth', auth);
        auth.use('/', authRoute);

        // Jobs
        const jobs = express.Router();
        api.use('/jobs', jobs);
        jobs.use(jwtMiddleware);
        jobs.use("/", jobsRoute);
};
