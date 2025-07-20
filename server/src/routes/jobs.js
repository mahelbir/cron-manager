import express from "express";
import createError from "http-errors";
import joi from "joi";

import * as mgr from '../utils/manager.js';
import jobId from "../middlewares/jobId.js";


const router = express.Router();

router.get("/", async (req, res) => {
    return res.json(await mgr.getAll());
});

router.get("/:id", jobId, async (req, res, next) => {
    try {
        return res.json(await mgr.getById(req.jobId));
    } catch (e) {
        return next(createError(400, e));
    }
});

router.post("/", setJob);

router.put("/:id", jobId, setJob);

router.patch("/:id", jobId, async (req, res, next) => {
    try {
        const schema = joi.object({
            name: joi.string().min(3).max(255).trim().label("Name"),
            interval: joi.number().optional().label("Interval"),
            concurrent: joi.number().optional().label("Concurrent Jobs"),
            url: joi.string().min(6).trim().label("URL"),
            status: joi.alternatives([true, false]).label("Status"),
            method: joi.alternatives(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]).label("Request Method"),
            options: joi.object().label("Options"),
            response: joi.object({
                check: joi.string().trim().required(),
                interval: joi.number().min(0).required()
            }).default({"check": null, "interval": 0}).label("Response"),
        });
        const {error} = schema.validate(req.body);
        if (error) return res.status(400).send({error: error.details[0].message});

        return res.json(await mgr.modify(req.body, req.jobId));
    } catch (e) {
        return next(createError(400, e));
    }
});

router.delete("/:id", jobId, async (req, res) => {
    await mgr.remove(req.jobId);
    return res.sendStatus(204);
});

async function setJob(req, res, next) {
    try {
        const schema = joi.object({
            name: joi.string().min(3).max(255).trim().required().label("Name"),
            interval: joi.number().min(0).required().label("Interval"),
            concurrent: joi.number().optional().label("Concurrent Jobs"),
            url: joi.string().min(6).trim().required().label("URL"),
            status: joi.alternatives([0, 1, true, false]).default(true).optional().label("Status"),
            method: joi.alternatives(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]).default("GET").optional().label("Request Method"),
            options: joi.object().default({}).optional().label("Options"),
            response: joi.object({
                check: joi.string().trim().required(),
                interval: joi.number().min(0).required()
            }).default({"check": null, "interval": 0}).optional().label("Response"),
        });
        const {error} = schema.validate(req.body);
        if (error) return res.status(400).send({error: error.details[0].message});

        return res.json(await mgr.set(req.body, req.jobId));
    } catch (e) {
        return next(createError(400, e));
    }
}

export default router;
