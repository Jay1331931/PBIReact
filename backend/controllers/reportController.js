const reportModel = require("../models/reportModel.js");

const reportController = {
  getEmbedToken: async (req, res) => {
    try {
      const workspaceId = process.env.WORKSPACE_ID;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        error: "Workspace ID is required"
      });
    }

      const data = await reportModel.generateEmbedTokenModel(workspaceId);

    return res.json({
      success: true,
      workspaceId,
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