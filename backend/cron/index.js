const { startSyncJob } = require("./syncReports.cron");

function initCronJobs() {
  // console.log("🚀 Initializing cron jobs...");
  startSyncJob();
}

module.exports = { initCronJobs };