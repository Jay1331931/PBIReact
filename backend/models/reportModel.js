const axios = require("axios");

const {
  fetchAzureToken,
  fetchReports,
  fetchDatasets
} = require("../services/reportServices.js");

const reportModel = {
  generateEmbedTokenModel: async (workspaceId) => {

    // 🔹 Step 1: Azure Token
    const azureToken = await fetchAzureToken();

    // 🔹 Step 2: Reports
    const reports = await fetchReports(workspaceId, azureToken);

    if (!reports || reports.length === 0) {
      throw new Error("No reports found in workspace");
    }

    // 🔹 Step 3: Datasets
    const datasets = await fetchDatasets(workspaceId, azureToken);

    const datasetIds = [
      ...new Set(reports.map(r => r.datasetId).filter(Boolean))
    ];

    // 🔹 Step 4: Build Request Body
    const requestBody = {
      datasets: datasetIds.map(id => ({ id })),
      reports: reports.map(r => ({
        id: r.id,
        allowEdit: false
      })),
      lifeSpanInMinutes: 60
    };

    // 🔥 Step 5: Generate Embed Token (DIRECT API CALL HERE)
    const tokenResponse = await axios.post(
      "https://api.powerbi.com/v1.0/myorg/GenerateToken",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${azureToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    const tokenData = tokenResponse.data;

    // 🔹 Step 6: Format Response
    const reportsWithUrls = reports.map(r => ({
      id: r.id,
      name: r.name,
      embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${r.id}&groupId=${workspaceId}`,
      datasetId: r.datasetId
    }));

    return {
      embedToken: tokenData.token,
      tokenExpiry: tokenData.expiration,
      tokenId: tokenData.tokenId,
      reports: reportsWithUrls,
      embedUrl: reportsWithUrls[0]?.embedUrl,
      reportId: reportsWithUrls[0]?.id
    };
  }
};

module.exports = reportModel;