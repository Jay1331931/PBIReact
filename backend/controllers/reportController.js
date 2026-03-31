const reportModel = require("../models/reportModel.js");
const { byodPool, byodPoolConnect, sql } = require("../config/byodDb.js"); // ✅ import

const reportController = {
  getEmbedToken: async (req, res) => {
    try {
      // const workspaceId = process.env.WORKSPACE_ID;
      const  reportKey  = req.query.reportKey;
      const d365User = req.query.d365User;
    // if (!workspaceId) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Workspace ID is required"
    //   });
    // }
    let username = null;
      let roles = [];

      if (d365User) {
        // ✅ Wait for pool to connect
        await byodPoolConnect;

        const result = await byodPool.request()
          .input("email", sql.NVarChar, d365User)
          .query(`
            SELECT TITLEID, NAME 
            FROM HcmEmployeeV2Staging 
            WHERE PRIMARYCONTACTEMAIL = @email
          `);

        const employee = result.recordset;

        if (employee && employee.length > 0) {
          username = d365User;
          roles = [employee[0].NAME];
          console.log(`✅ D365 User found: ${employee[0].NAME}, Role: ${employee[0].TITLEID}`);
        } else {
          console.warn(`⚠️ D365 User not found in BYOD: ${d365User}`);
          return res.status(403).json({
            success: false,
            error: "User not authorized to access this report"
          });
        }
      }

    if (!reportKey) {
        return res.status(400).json({
          success: false,
          error: "reportKey is required"
        });
      }

      const data = await reportModel.generateEmbedTokenModel(reportKey, username, roles);

    return res.json({
      success: true,
      ...data
    });

  } catch (error) {
    console.error("❌ Controller Error:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
};
module.exports = reportController;