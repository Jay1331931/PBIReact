const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const {
  CLIENT_ID,
  CLIENT_SECRET,
  TENANT_ID
} = process.env;

// 🔹 Azure Token
const fetchAzureToken = async () => {
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
};

// 🔹 Reports
const fetchReports = async (workspaceId, token) => {
  const res = await axios.get(
    `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return res.data.value;
};

// 🔹 Datasets
const fetchDatasets = async (workspaceId, token) => {
  const res = await axios.get(
    `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return res.data.value;
};

module.exports = {
  fetchAzureToken,
  fetchReports,
  fetchDatasets
};