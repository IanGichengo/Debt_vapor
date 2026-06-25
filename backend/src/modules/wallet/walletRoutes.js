const express = require("express");
const router = express.Router();
const walletController = require("./walletController");
const authenticate = require("../../middleware/authenticate");

// All wallet routes require a valid JWT
router.use(authenticate);

// ==========================
// WALLET ROUTES
// ==========================

// GET /api/wallet/balance   → lightweight balance check (sidebar widget)
router.get("/balance", walletController.getWalletBalance);

// GET /api/wallet           → full wallet + transaction history (My Account)
router.get("/", walletController.getWallet);

// GET /api/wallet/transactions?page=1&limit=10  → paginated ledger
router.get("/transactions", walletController.getTransactions);

module.exports = router;
