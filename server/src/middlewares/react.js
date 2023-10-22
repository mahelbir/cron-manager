import path from "path";
import config from "../config/config.js";

export default (req, res, next) => {

    try {
        return res.sendFile(
            path.join(config.path.static, "index.html")
        );
    } catch (e) {
        return next(e);
    }

}