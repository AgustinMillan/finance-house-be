const express = require("express");
const router = express.Router();

const accountService = require("../services/account.service");

router.post("/", async (req, res) => {
  try {
    const result = await accountService.createAccount(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await accountService.getAccounts();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const result = await accountService.updateAccount(req.params.id, req.body);
    res.status(203).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
