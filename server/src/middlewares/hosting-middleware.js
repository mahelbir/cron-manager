import path from "path";
import config from "../config/config.js";

export default (req, res) => {

    return res.sendFile(path.join(config.path.static, "index.html"));

}