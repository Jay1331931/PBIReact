import { useEffect, useState } from "react";
import axios from "axios";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import "./App.css"; 
function App() {
  const [embedConfig, setEmbedConfig] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8080/getEmbedToken")
      .then(res => {
        setEmbedConfig({
          type: "report",
          id: "8bc103bc-a6f6-4157-90e5-56637b71e746",
          embedUrl: res.data.embedUrl,
          accessToken: res.data.embedToken,
          tokenType: models.TokenType.Embed
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
