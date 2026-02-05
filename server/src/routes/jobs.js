import {newRoute} from "../core/router.js";
import jwtMiddleware from "../middlewares/jwt-middleware.js";
import joi from "joi";
import {HTTP_METHODS} from "../utils/helper.js";
import Job from "../models/job.js";


const router = await newRoute("/api/jobs", [jwtMiddleware]);
const schema = joi.object({
    name: joi.string().min(2).max(255).trim().required().label("Name"),
    tag: joi.string().max(255).trim().optional().allow('').default(null).label("Tag"),
    interval: joi.number().min(0).required().label("Interval"),
    concurrent: joi.number().optional().label("Concurrent Jobs"),
    url: joi.string().min(6).trim().required().label("URL"),
    status: joi.alternatives([0, 1, true, false]).default(true).optional().label("Status"),
    method: joi.alternatives(HTTP_METHODS).default("GET").optional().label("Request Method"),
    options: joi.object().default(null).optional().label("Options"),
    response: joi.object({
        check: joi.string().trim().required(),
        interval: joi.number().min(0).required()
    }).optional().default(null).label("Response"),
});

// Get all jobs
router.get("/", async (req, res) => {
    const jobs = await Job.findAll({
        attributes: ['id', 'name', 'tag', 'interval', 'url', 'method', 'status'],
        order: [['id', 'DESC']]
    });
    for (let i = 0; i < jobs.length; i++) {
        const activity = await jobs[i].getLastRunAt();
        jobs[i] = jobs[i].toJSON();
        jobs[i].activity = activity;
    }
    return res.send(jobs);
});

// Get a specific job
router.get("/:id", async (req, res) => {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
        return res
            .status(404)
            .send({error: "Job not found"});
    }
    return res.send(job);
});

// Create a new job
router.post("/", async (req, res) => {
    const {error, value} = schema.validate(req.body);
    if (error) {
        return res
            .status(400)
            .send({error: error.details[0].message});
    }
    const job = await Job.create(value);
    return res.status(201).send(job);
});

// Update an existing job
router.put("/:id", async (req, res) => {
    const {error, value} = schema.validate(req.body);
    if (error) {
        return res
            .status(400)
            .send({error: error.details[0].message});
    }

    const job = await Job.findByPk(req.params.id, {
        attributes: ['id']
    });
    if (!job) {
        return res
            .status(404)
            .send({error: "Job not found"});
    }
    await job.update(value);
    return res.send(job);
});

// Toggle job status
router.patch("/:id/toggle", async (req, res) => {
    const job = await Job.findByPk(req.params.id, {
        attributes: ['id', 'status']
    });
    if (!job) {
        return res
            .status(404)
            .send({error: "Job not found"});
    }
    await job.update({
        status: Boolean(req.body.status)
    });
    return res.send({status: job.status});
});

// Delete a job
router.delete("/:id", async (req, res) => {
    const job = await Job.findByPk(req.params.id, {
        attributes: ['id']
    });
    if (!job) {
        return res
            .status(404)
            .send({error: "Job not found"});
    }
    await job.deleteCache();
    await job.destroy();
    return res.status(204).send();
});