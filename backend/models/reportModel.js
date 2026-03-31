const axios = require("axios");
const pool = require("../db/db");
const {
  fetchAzureToken,
  fetchReports,
  fetchDatasets
} = require("../services/reportServices.js");

const reportModel = {
  generateEmbedTokenModel: async (reportKey, username, roles) => {
// 🔹 Step 1: Get report from DB mapping
    const result = await pool.query(
      `
      SELECT report_id, dataset_id, workspace_id
      FROM customer_report_staging
      WHERE report_key = $1 AND is_active = TRUE
      `,
      [reportKey]
    );

    if (result.rows.length === 0) {
      throw new Error("Report not found for given reportKey");
    }

    const report = result.rows[0];

    // 🔹 Step 1: Azure Token
    const azureToken = await fetchAzureToken();

    // 🔹 Step 2: Reports
    // const reports = await fetchReports(workspaceId, azureToken);

    // if (!reports || reports.length === 0) {
    //   throw new Error("No reports found in workspace");
    // }

    // 🔹 Step 3: Datasets
    // const datasets = await fetchDatasets(workspaceId, azureToken);

    // const datasetIds = [
    //   ...new Set(reports.map(r => r.datasetId).filter(Boolean))
    // ];

    // 🔹 Step 4: Build Request Body
    // const requestBody = {
    //   datasets: datasetIds.map(id => ({ id })),
    //   reports: reports.map(r => ({
    //     id: r.id,
    //     allowEdit: false
    //   })),
    //   lifeSpanInMinutes: 60
    // };

    const requestBody = {
      datasets: [{ id: report.dataset_id }],
      reports: [
        {
          id: report.report_id,
          allowEdit: false
        }
      ],
      targetWorkspaces: [
        {
          id: report.workspace_id
        }
      ],
      lifeSpanInMinutes: 60,
      identities: username && roles?.length > 0 ? [
        {
          username: username,
          roles: roles,
          datasets: [report.dataset_id]
        }
      ] : undefined
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
    ).catch(err => {
  console.error("Power BI API Error:", JSON.stringify(err.response?.data, null, 2));
  console.error("Request Body Sent:", JSON.stringify(requestBody, null, 2));
  throw err;
});

    const tokenData = tokenResponse.data;

    // 🔹 Step 6: Format Response
    // const reportsWithUrls = reports.map(r => ({
    //   id: r.id,
    //   name: r.name,
    //   embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${r.id}&groupId=${workspaceId}`,
    //   datasetId: r.datasetId
    // }));

    // return {
    //   embedToken: tokenData.token,
    //   tokenExpiry: tokenData.expiration,
    //   tokenId: tokenData.tokenId,
    //   reports: reportsWithUrls,
    //   embedUrl: reportsWithUrls[0]?.embedUrl,
    //   reportId: reportsWithUrls[0]?.id
    // };
    const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${report.report_id}&groupId=${report.workspace_id}`;

    return {
      embedToken: tokenData.token,
      tokenExpiry: tokenData.expiration,
      reportId: report.report_id,
      embedUrl
    };
  }
};

module.exports = reportModel;