import socket from "../core/socket.js";
import {BackgroundJob, BackgroundJobRunner} from "../utils/background-job.js";
import Job from "../models/job.js";
import {sleepMs} from "melperjs";
import {maxios} from "@mahelbir/maxios";
import config from "../config/config.js";


export default async () => {

    class BackgroundServiceObject extends BackgroundJob {

        async execute() {
            let timeStart = Date.now();
            try {
                const job = await Job.findByPk(this.jobId);
                if (!job) {
                    this.log("Job not found");
                    return;
                }
                this.name = job.name;
                this.tag = job.tag;

                let request = {};
                if (typeof job?.options === "object") {
                    request = job.options;
                }
                if (typeof request?.headers !== "object") {
                    request.headers = {};
                }
                if (typeof request.timeout !== "number") {
                    request.timeout = this.requestTimeout;
                }
                if (!this.disableCronKeyHeader) {
                    request.headers["x-cron-key"] = this.id;
                }
                request.maxContentLength = this.requestMaxContentLength;
                request.method = job.method;
                request.url = job.url;

                const sleepDuration = this.nextExecutionTime - Date.now();
                sleepDuration > 0 && await sleepMs(sleepDuration);

                let response, status;
                timeStart = Date.now();
                try {
                    response = await maxios.request(request);
                    status = response.status;
                } catch (e) {
                    response = e?.response;
                    status = e?.response?.status || e.message;
                }
                const timeEnd = Date.now();

                let interval = job.interval * 1000;
                if (job?.response?.check && response?.data && job.response.check.trim() === response.data.trim()) {
                    interval = job.response.interval * 1000;
                }
                this.nextExecutionTime = timeEnd + interval;

                if (job) {
                    const mtime = await job.updateLastRunAt();
                    socket.get().emit("time", {
                        id: job.id,
                        time: mtime
                    });
                }

                const timeElapsed = timeEnd - timeStart;
                const seconds = Math.max(0.01, (timeElapsed / 1000)).toFixed(2);
                const message = [
                    `Status: ${status}`,
                    `Completed: ${seconds} secs`
                ].join(" | ");
                this.log(message);

            } catch (e) {
                this.log(e.message);
            }
        }

        log(message) {
            message = `[ ${this.tag ? "#" + this.tag + ' ' : ''}${this.name} ] ${message}`;
            console.info(message);
            socket.get().emit("watch", message);
        }

        init({jobId, jobIndex}) {
            this.jobId = jobId;
            this.jobIndex = jobIndex;
            this.requestMaxContentLength = config.env.REQUEST_MAX_CONTENT_LENGTH || 1048576; // 1 MB
            this.requestTimeout = config.env.REQUEST_TIMEOUT || 180000; // 3 minutes
            this.disableCronKeyHeader = config.env.DISABLE_CRON_KEY_HEADER === 'true' || false;
        }

        terminate() {
            this.log("Disabled");
        }

    }

    class BackgroundServiceRunner extends BackgroundJobRunner {
        async getExecutableJobs() {
            const jobs = await Job.findAll({
                where: {
                    status: true
                },
                attributes: ['id', 'concurrent']
            });
            return jobs.reduce((acc, job) => {
                for (let index = 1; index <= job.concurrent; index++) {
                    acc.push({
                        id: `${job.id}_${index}`,
                        job: BackgroundServiceObject,
                        params: {
                            jobId: job.id,
                            jobIndex: index
                        }
                    });
                }
                return acc;
            }, []);
        }
    }

    const runner = new BackgroundServiceRunner("Background Service");
    await runner.executeJobs();

}