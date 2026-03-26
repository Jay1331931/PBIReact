const express = require("express");
const reportController = require("../controllers/reportController.js");

const router = express.Router();

router.get("/getEmbedToken", reportController.getEmbedToken);

module.exports = router;