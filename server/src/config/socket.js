import jwt from "jsonwebtoken";
import createError from "http-errors";
import {Server} from "socket.io";

import config from "./config.js";


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
                const token = socket.handshake.headers['x-auth'];
                if (token && jwt.verify(token, config.env.SECRET_KEY))
                    return next();
            } catch (e) {
                return next(createError(401, e.message));
            }
            return next(createError(401));
        }).on('connection', (socket) => {
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