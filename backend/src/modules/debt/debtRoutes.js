const express = require("express");
const router = express.Router();
const debtController = require("./debtController");
const debtValidation = require("./debtValidation");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validateRequest = require("../../middleware/validateRequest");
const rateLimit = require("express-rate-limit");

// Rate limiter for mutation operations
const modifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: "Too many requests, please try again later",
});

// Rate limiter for read operations
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later",
});

/**
 * @route   POST /api/debts
 * @desc    Create a new debt
 * @access  Private (ADMIN, COLLECTOR)
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "COLLECTOR"),
  modifyLimiter,
  validateRequest(debtValidation.createDebt),
  debtController.createDebt
);

/**
 * @route   GET /api/debts
 * @desc    Get all debts with pagination and filtering
 * @access  Private (All authenticated users)
 */
router.get(
  "/",
  authenticate,
  readLimiter,
  validateRequest(debtValidation.getAllDebts),
  debtController.getAllDebts
);

/**
 * @route   GET /api/debts/all
 * @desc    Get all debts for dashboard (no pagination)
 * @access  Private (All authenticated users)
 */
router.get("/all", authenticate, readLimiter, debtController.getAllDebtsForDashboard);

/**
 * @route   GET /api/debts/bulk-summary
 * @desc    Get debts summary for multiple debtors
 * @access  Private (All authenticated users)
 */
router.get("/bulk-summary", authenticate, readLimiter, debtController.getBulkDebtsSummary);

/**
 * @route   GET /api/debts/dashboard-stats
 * @desc    Get comprehensive dashboard statistics
 * @access  Private (All authenticated users)
 */
router.get("/dashboard-stats", authenticate, readLimiter, debtController.getDashboardStats);

/**
 * @route   GET /api/debts/stats
 * @desc    Get debt statistics
 * @access  Private (All authenticated users)
 */
router.get("/stats", authenticate, readLimiter, debtController.getDebtStats);

/**
 * @route   GET /api/debts/:id
 * @desc    Get a single debt by ID
 * @access  Private (All authenticated users)
 */
router.get(
  "/:id",
  authenticate,
  readLimiter,
  validateRequest(debtValidation.getDebtById),
  debtController.getDebtById
);

/**
 * @route   PUT /api/debts/:id
 * @desc    Update a debt
 * @access  Private (ADMIN, COLLECTOR)
 */
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "COLLECTOR"),
  modifyLimiter,
  validateRequest(debtValidation.updateDebt),
  debtController.updateDebt
);

/**
 * @route   DELETE /api/debts/:id
 * @desc    Delete a debt (soft delete)
 * @access  Private (ADMIN, COLLECTOR)
 */
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "COLLECTOR"),
  modifyLimiter,
  validateRequest(debtValidation.deleteDebt),
  debtController.deleteDebt
);

/**
 * @route   POST /api/debts/:id/payment
 * @desc    Record a payment for a debt
 * @access  Private (ADMIN, COLLECTOR)
 */
router.post(
  "/:id/payment",
  authenticate,
  authorize("ADMIN", "COLLECTOR"),
  modifyLimiter,
  validateRequest(debtValidation.recordPayment),
  debtController.recordPayment
);

module.exports = router;
