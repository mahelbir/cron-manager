import {Server} from "socket.io";

import config from "../config/config.js";
import {verifyJwt} from "../middlewares/jwt-middleware.js";
import createError from "http-errors";


let io = null;

export default {
    init(server) {
        io = new Server(server, {
            cors: {
                origin: (config.env.NODE_ENV === 'production' ? null : ['http://localhost:5173']),
                methods: ["GET"]
            }
        });
        io.use((socket, next) => {
            try {
                let token;
                token = socket.handshake.headers.authorization;
                if (token) {
                    token = token.split(" ");
                    token = token[token.length - 1];
                    if (verifyJwt(token))
                        return next();
                }
            } catch {
            }
            return next(createError(401));
        })
    },
    get() {
        return io;
    }
}