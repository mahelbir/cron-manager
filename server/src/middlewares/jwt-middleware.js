import jwt from "jsonwebtoken";
import {expressjwt} from "express-jwt";

import config from "../config/config.js";

export function verifyJwt(token) {
    return token && jwt.verify(token, config.env.SECRET_KEY);
}

export default expressjwt({
    algorithms: ['HS256'],
    secret: config.env.SECRET_KEY
});