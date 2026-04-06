const express = require("express");
const router = express.Router();
const reportService = require("../services/report.service");

router.get("/monthly", async (req, res) => {
  try {
    const today = new Date();
    // Use provided year/month or defaults to current
    const year = parseInt(req.query.year) || today.getFullYear();
    const month = parseInt(req.query.month) || today.getMonth() + 1;

    const result = await reportService.getMonthlyReport(year, month);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
