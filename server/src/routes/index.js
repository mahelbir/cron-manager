import express from "express";

import react from "../middlewares/react.js";


const router = express.Router();

router.get("/", react);

export default router;
