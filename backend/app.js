const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT;
const reportRoutes = require("./routes/reportRoutes.js");
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use("/api/reports", reportRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});