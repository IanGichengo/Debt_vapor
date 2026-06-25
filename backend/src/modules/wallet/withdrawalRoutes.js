const express = require("express");
const router = express.Router();
const controller = require("./withdrawalController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");

// All withdrawal routes require authentication
router.use(authenticate);

// ==========================
// CREDITOR ROUTES
// ==========================

// POST /api/withdrawals         → submit a new withdrawal request
router.post("/", controller.requestWithdrawal);

// GET  /api/withdrawals         → list own withdrawal history
router.get("/", controller.getMyWithdrawals);

// ==========================
// ADMIN-ONLY ROUTES
// ==========================

// PATCH /api/withdrawals/:id/approve
router.patch("/:id/approve", authorize("ADMIN"), controller.approveWithdrawal);

// PATCH /api/withdrawals/:id/reject
router.patch("/:id/reject", authorize("ADMIN"), controller.rejectWithdrawal);

module.exports = router;
