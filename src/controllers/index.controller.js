const express = require("express");
const router = express.Router();

// Rutas
router.use("/categories", require("./category.controller"));
router.use("/balance/accounts", require("./account.controller"));
router.use("/balance/payments", require("./transaction.controller"));
router.use("/reports", require("./report.controller"));

module.exports = router;
