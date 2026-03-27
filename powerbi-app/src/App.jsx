import { useEffect, useState } from "react";
import axios from "axios";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import "./App.css"; 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
function App() {
  const [embedConfig, setEmbedConfig] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/reports/getEmbedToken`)
      .then(res => {
        setEmbedConfig({
          type: "report",
          id: res.data.reportId,
          embedUrl: res.data.embedUrl,
          accessToken: res.data.embedToken,
          tokenType: models.TokenType.Embed,
          settings: {
    panes: {
      filters: { visible: true },
      pageNavigaation: { visible: true }
    },
    navContentPaneEnabled: true
  }
        });
      });
  }, []);

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
