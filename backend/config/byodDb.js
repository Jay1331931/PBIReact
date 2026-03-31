const sql = require("mssql");

const byodConfig = {
  server: process.env.BYOD_DB_SERVER,   // yourserver.database.windows.net
  database: process.env.BYOD_DB_NAME,
  user: process.env.BYOD_DB_USER,
  password: process.env.BYOD_DB_PASSWORD,
  options: {
    encrypt: true,           // required for Azure SQL
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const byodPool = new sql.ConnectionPool(byodConfig);
const byodPoolConnect = byodPool.connect();

byodPool.on("error", (err) => {
  console.error("BYOD DB connection error:", err);
});

module.exports = { byodPool, byodPoolConnect, sql };