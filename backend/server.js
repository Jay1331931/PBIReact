import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import jwt from 'jsonwebtoken';
const app = express();
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true
}));
app.use(express.json());
dotenv.config();

const {
  CLIENT_ID,
  CLIENT_SECRET,
  TENANT_ID,
  WORKSPACE_ID,
  REPORT_ID
} = process.env;

// Step 1: Get Azure AD Token
async function getAzureToken() {
  const res = await axios.post(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "https://analysis.windows.net/powerbi/api/.default"
    })
  );
  return res.data.access_token;
}

// Step 2: Generate Embed Token
// app.get("/getEmbedToken", async (req, res) => {
//   try {
//     const azureToken = await getAzureToken();
//     const response = await axios.post(
//       `https://api.powerbi.com/v1.0/myorg/groups/${WORKSPACE_ID}/reports/${REPORT_ID}/GenerateToken`,
//       { accessLevel: "View" },
//       {
//         headers: {
//           Authorization: `Bearer ${azureToken}`,
//         },
//       }
//     );
//     // console.log("Embed Token Response:", response.data);
//     res.json({
//       embedToken: response.data.token,
//       embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${REPORT_ID}&groupId=${WORKSPACE_ID}`
//     });

//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).send("Error generating token");
//   }
// });

app.get("/getEmbedToken", async (req, res) => {
  try {
    const workspaceId  = WORKSPACE_ID;
   
    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        error: "Workspace ID is required",
        hint: "Use: /api/generate-token/YOUR_WORKSPACE_ID"
      });
    }
    const azureToken = await getAzureToken();
   
    const reportsResponse = await axios.get(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports`,
      {
        headers: {
          Authorization: `Bearer ${azureToken}`,
        },
      }
    );
   
    const reports = reportsResponse.data.value;
   
    if (!reports || reports.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No reports found in this workspace",
        workspaceId: workspaceId
      });
    }
   
    const datasetsResponse = await axios.get(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets`,
      {
        headers: {
          Authorization: `Bearer ${azureToken}`,
        },
      }
    );
   
    const datasets = datasetsResponse.data.value;
    const datasetIds = [...new Set(reports.map(r => r.datasetId).filter(id => id))];
   
    const requestBody = {
      datasets: datasetIds.map(id => ({ id: id })),
      reports: reports.map(report => ({
        id: report.id,
        allowEdit: false
      })),
      lifeSpanInMinutes: 60
    };
   
    const tokenResponse = await axios.post(
      "https://api.powerbi.com/v1.0/myorg/GenerateToken",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${azureToken}`,
          "Content-Type": "application/json",
        },
      }
    );
   
    const reportsWithUrls = reports.map(report => ({
      id: report.id,
      name: report.name,
      embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${report.id}&groupId=${workspaceId}`,
      datasetId: report.datasetId
    }));
   
    res.json({
      success: true,
      workspaceId: workspaceId,
      embedToken: tokenResponse.data.token,
      tokenExpiry: tokenResponse.data.expiration,
      tokenId: tokenResponse.data.tokenId,
      summary: {
        totalReports: reports.length,
        totalDatasets: datasetIds.length,
        reportsList: reports.map(r => r.name)
      },
      reports: reportsWithUrls,
      // For backward compatibility - return first report URL if needed
      embedUrl: reportsWithUrls[0]?.embedUrl,
      defaultReportId: reports[0]?.id
    });
   
  } catch (error) {
    console.error("❌ Error generating token:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
   
    if (error.response?.data?.error?.code === 'PowerBINotAuthorizedException') {
      res.status(403).json({
        success: false,
        error: "Not authorized to access this workspace",
        details: "Make sure the user has access to the workspace",
        workspaceId: req.params.workspaceId
      });
    } else {
      res.status(error.response?.status || 500).json({
        success: false,
        error: "Error generating token",
        details: error.response?.data || error.message,
        workspaceId: req.params.workspaceId
      });
    }
  }
});

app.listen(8080, () => console.log("Backend running on port 8080"));