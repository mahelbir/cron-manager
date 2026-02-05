import {newRoute} from "../core/router.js";
import hostingMiddleware from "../middlewares/hosting-middleware.js";


const router = await newRoute("/");

router.get("/", hostingMiddleware);