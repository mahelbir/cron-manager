import path from "path";

import express from "express";

import config from "../config/config.js";


const router = express.Router();

router.get("/", async (req, res) => {
    return res.sendFile(
        path.join(config.path.static, "index.html")
    );
});

export default router;
