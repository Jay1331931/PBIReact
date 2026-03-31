import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import "./App.css"; 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
function App() {
  const [embedConfig, setEmbedConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const d365User = params.get("d365User");
  const reportKey = params.get("reportKey");
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const reportKey = params.get("reportKey");
  //   const d365User = params.get("d365User");

  //   if (!reportKey) {
  //     console.error("❌ reportKey missing in URL");
  //     return;
  //   }
  //   axios
  //     .get(`${API_BASE_URL}/reports/getEmbedToken`, {
  //       params: { reportKey }
  //     })
  //     .then(res => {
  //       setEmbedConfig({
  //         type: "report",
  //         id: res.data.reportId,
  //         embedUrl: res.data.embedUrl,
  //         accessToken: res.data.embedToken,
  //         tokenType: models.TokenType.Embed,
  //         settings: {
  //   panes: {
  //     filters: { visible: true },
  //     pageNavigaation: { visible: true }
  //   },
  //   navContentPaneEnabled: true
  // }
  //       });
  //     });
  // }, []);
const fetchEmbedToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!reportKey) {
        console.error("❌ reportKey missing in URL");
      setError("ReportKey missing in URL");
      setLoading(false);
      return;
    }

      // ✅ Validate required params before calling API
      if (!d365User) {
        setError("User identity not provided. Please access this report from D365.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/reports/getEmbedToken`,
        {
          params: { d365User, reportKey },
        }
      );

      const { reportId, embedUrl, embedToken } = response.data;

      // ✅ Validate response data
      if (!reportId || !embedUrl || !embedToken) {
        throw new Error("Incomplete embed configuration received from server.");
      }

      setEmbedConfig({
        type: "report",
        id: reportId,
        embedUrl: embedUrl,
        accessToken: embedToken,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: {
            filters: { visible: true },
            pageNavigation: { visible: true }, // ✅ Fixed typo: pageNavigaation
          },
          navContentPaneEnabled: true,
          background: models.BackgroundType.Transparent,
        },
      });

    } catch (err) {
      console.error("❌ Failed to fetch embed token:", err);

      // ✅ Handle specific error responses
      if (err.response?.status === 401) {
        setError("Session expired or unauthorized. Please login again from D365.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view this report. Contact your administrator.");
      } else if (err.response?.status === 500) {
        setError("Server error occurred. Please try again later.");
      } else {
        setError(err.response?.data?.error || "Failed to load report. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [d365User]);

  useEffect(() => {
    fetchEmbedToken();
  }, [fetchEmbedToken]);

  if (loading) {
    return (
      <div className="app-container">
        <div className="status-container">
          <div className="spinner" />
          <p className="status-message">Loading report, please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="status-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={fetchEmbedToken}>
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="app-container">
      <div className="powerbi-wrapper">
        {embedConfig && (
        <PowerBIEmbed
          embedConfig={embedConfig}
        />
      )}
      </div>
    </div>
  );
}

export default App;
