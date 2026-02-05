import {forever, randomInteger, sleepMs} from "melperjs";

export class BackgroundJob {

    constructor(runner, id) {
        this.name = `BackgroundJob-${id}`;
        this.runner = runner;
        this.id = id;
    }

    init(params = null) {
    }

    terminate() {
    }

    async execute() {
    }

    isJobEnabled() {
        return this.runner.isJobEnabled(this.id);
    }

    disableJob(suspendDuration = 3000) {
        this.runner.disableJob(this.id);
        suspendDuration && this.runner.suspendJob(this.id, suspendDuration);
    }

}

export class BackgroundJobRunner {

    constructor(name = "BackgroundJobRunner") {
        this.name = name;
        this.enabledJobs = {};
        this.runningJobs = {};
        this.suspendedJobs = {};
    }

    isJobEnabled(id) {
        return id in this.enabledJobs;
    }

    isJobRunning(id) {
        return id in this.runningJobs;
    }

    disableJob(id) {
        delete this.enabledJobs[id];
    }

    suspendJob(id, duration) {
        this.suspendedJobs[id] = Date.now() + duration;
    }

    startJob(job) {
        const id = job.id;
        if (!this.runningJobs[id]) {
            this.runningJobs[id] = new job.job(this, id);
        }
        const ref = this.runningJobs[id];
        ref.init(job.params);
        // console.info(`[${ref.name}] started`);
        return ref.execute()
            .then(() => {
                // console.info(`[${ref.name}] completed`);
            })
            .catch((e) => {
                console.error(`[${ref.name}] error`, e);
            })
            .finally(() => {
                if (this.isJobEnabled(id)) {
                    this.startJob(job);
                } else {
                    // console.info(`[${ref.name}] stopped`);
                    ref.terminate();
                    delete this.runningJobs[id];
                }
            });
    }

    async executeJobs(interval = 1000) {
        await forever(interval, async () => {
            const jobs = await this.getExecutableJobs();
            this.enabledJobs = {};
            for (const job of jobs) {
                const id = job.id;

                if (id in this.suspendedJobs) {
                    if (Date.now() > this.suspendedJobs[id]) {
                        delete this.suspendedJobs[id];
                        this.enabledJobs[id] = true;
                    }
                } else {
                    this.enabledJobs[id] = true;
                }

                if (this.isJobEnabled(id) && !this.isJobRunning(id)) {
                    await sleepMs(randomInteger(300, 1000));
                    this.startJob(job);
                }
            }
        }, (e) => {
            console.error(`[${this.name}] error`, e);
        });
    }

    async getExecutableJobs() {
        return [];
    }

    static iteratingJobList(jobCount, job, params = null) {
        return Array.from({length: jobCount}, (_, i) => ({
            id: i + 1,
            job: job,
            params: params
        }));
    }

}

