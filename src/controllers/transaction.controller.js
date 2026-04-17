const express = require("express");
const router = express.Router();
const transactionService = require("../services/transaction.service");

router.get("/", async (req, res) => {
  try {
    const result = await transactionService.getTransactions(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await transactionService.getTransactionById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await transactionService.createTransaction(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    result = await transactionService.updateTransaction(
      req.params.id,
      req.body,
    );
    res.status(203).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/transfer", async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount, date, description } = req.body;
    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({
        success: false,
        error: "fromAccountId, toAccountId y amount son obligatorios",
      });
    }
    const result = await transactionService.createTransfer({
      fromAccountId: Number(fromAccountId),
      toAccountId: Number(toAccountId),
      amount,
      date,
      description,
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
