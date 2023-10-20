import runCron from "../scripts/run.js";

export default async app => {

    // Test Cron
    runCron().then(() => {}).catch(e => console.error("SCRIPT:runCron:ERROR: " + e.message));
}