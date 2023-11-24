import createError from "http-errors";
import {Server} from "socket.io";

import config from "./config.js";
import {verifyJwt} from "../middlewares/jwt.js";


let io = null;

export default {
    init: function (server) {
        console.log(config.env.NODE_ENV)
        io = new Server(server, {
            cors: {
                origin: (config.env.NODE_ENV.trim() === 'development' ? ['http://localhost:5173'] : null),
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
            } catch (e) {
                return next(createError(401, e.message));
            }
            return next(createError(401));
        })
        io.on('connection', (socket) => {
            console.info('SOCKET | client connected: ' + socket.id);
            socket.on('disconnect', () => {
                console.info('SOCKET | client disconnected: ' + socket.id);
            });
        });
    },
    get: function () {
        return io;
    }
}