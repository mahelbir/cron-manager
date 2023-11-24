import jwt from "jsonwebtoken";
import {expressjwt} from "express-jwt";

import config from "../config/config.js";


export const algorithm = "HS256";
const algorithms = [algorithm];

export function verifyJwt(token) {
    return token && jwt.verify(token, config.env.SECRET_KEY, {algorithms})
}

export default expressjwt({
    secret: config.env.SECRET_KEY,
    algorithms
});