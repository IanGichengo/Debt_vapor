const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  getTransactionStatus,
  getDebtorTransactions,
  retryTransaction,
  processFailedTransactions,
  getRetryStats,
} = require("./mpesa.controller");
const { handleMpesaCallback } = require("./mpesa.callback");
const authenticate = require("../../middleware/authenticate");

// Public routes
router.post("/callback", handleMpesaCallback);

// Protected routes (require authentication)
router.post("/pay", authenticate, initiatePayment);
router.get(
  "/transaction/:checkoutRequestID",
  authenticate,
  getTransactionStatus,
);
router.get(
  "/transactions/debtor/:debtorId",
  authenticate,
  getDebtorTransactions,
);
router.post("/retry/:transactionId", authenticate, retryTransaction);
router.post("/process-failed", authenticate, processFailedTransactions);
router.get("/retry-stats", authenticate, getRetryStats);

module.exports = router;
