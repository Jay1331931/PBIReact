const cron = require("node-cron");
const { syncReports } = require("../services/powerbi.service");

function startSyncJob() {
  // Every 10 minutes
  cron.schedule("*/2 * * * *", async () => {
    // console.log("⏳ Running Power BI sync...");

    try {
      await syncReports();
      // console.log("✅ Sync completed");
    } catch (err) {
      // console.error("❌ Sync failed:", err.message);
    }
  });
}

module.exports = { startSyncJob };