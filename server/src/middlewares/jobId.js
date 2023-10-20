import {jobId} from "../utils/manager.js";

export default (req, res, next) => {
    const id = jobId(req.params.id);
    if (!id)
        return res.status(400).send({error: "Invalid ID parameter!"})

    req.jobId = id;
    return next();
}