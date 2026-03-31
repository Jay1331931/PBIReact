const cron = require("node-cron");
const { syncReports } = require("../services/powerbi.service");

function startSyncJob() {
  // Every 10 minutes
  setTimeout(() => {
  cron.schedule("*/10 * * * *", async () => {
    // console.log("⏳ Running Power BI sync...");

    try {
      await syncReports();
      // console.log("✅ Sync completed");
    } catch (err) {
      // console.error("❌ Sync failed:", err.message);
    }
  });
}, 10000);
}

module.exports = { startSyncJob };