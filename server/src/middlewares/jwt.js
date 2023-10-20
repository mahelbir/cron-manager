import jwt from "jsonwebtoken";
import createError from "http-errors";

import config from "../config/config.js";


export default async (req, res, next) => {
    try {
        const token = req.header("x-auth");
        if (token && jwt.verify(token, config.env.SECRET_KEY))
            return next();
    } catch {
    }
    return next(createError(401));
}