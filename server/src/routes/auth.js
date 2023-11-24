import express from "express";
import jwt from "jsonwebtoken";

import config from "../config/config.js";
import {algorithm} from "../middlewares/jwt.js";


const router = express.Router();

router.post("/login", async (req, res, next) => {
    try {
        if (req.body.password.toString() === config.env.PASSWORD.toString())
            return res.json({
                token: jwt.sign({}, config.env.SECRET_KEY, {
                    algorithm,
                    expiresIn: "7d"
                })
            });

        return res.status(400).json({
            error: "Login failed!"
        })
    } catch (e) {
        return next(e);
    }
});

export default router;
