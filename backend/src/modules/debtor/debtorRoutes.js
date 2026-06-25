const express = require("express");
const router = express.Router();
const debtorController = require("./debtorController");
const debtorValidation = require("./debtorValidation");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validateRequest = require("../../middleware/validateRequest");
const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for debtor creation/modification
 * Allows 30 requests per 15 minutes
 */
const debtorModifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: "Too many requests, please try again later",
});

/**
 * @route   POST /api/debtors
 * @desc    Create a new debtor
 * @access  Private (Admin, Collector)
 */
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "COLLECTOR"),
  debtorModifyLimiter,
  validateRequest(debtorValidation.create),
  debtorController.create
);

/**
 * @route   GET /api/debtors
 * @desc    Get all debtors with filters and pagination
 * @access  Private (Admin, Collector)
 */
router.get(
  "/",
  authenticate,
  validateRequest(debtorValidation.getAll),
  debtorController.getAllDebtors
);

/**
 * @route   GET /api/debtors/:id
 * @desc    Get a single debtor by ID
 * @access  Private (Admin, Collector)
 */
router.get(
  "/:id",
  authenticate,
  validateRequest(debtorValidation.getById),
  debtorController.getById
);

/**
 * @route   GET /api/debtors/:id/chat-history
 * @desc    Get WhatsApp chat history (sent reminders)
 * @access  Private (Admin, Collector)
 */
router.get(
  "/:id/chat-history",
  authenticate,
  debtorController.getChatHistory
);

/**
 * ⭐ ALIAS ROUTE for frontend compatibility
 * @route   GET /api/debtors/:id/chats
 * @desc    Alias for /chat-history (frontend expects /chats)
 * @access  Private (Admin, Collector)
 */
router.get(
  "/:id/chats",
  authenticate,
  debtorController.getChatHistory
);

/**
 * @route   PUT /api/debtors/:id
 * @desc    Update a debtor
 * @access  Private (Admin, Collector)
 */
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "COLLECTOR"),
  debtorModifyLimiter,
  validateRequest(debtorValidation.update),
  debtorController.update
);

/**
 * @route   DELETE /api/debtors/:id
 * @desc    Delete a debtor (soft delete)
 * @access  Private (Admin, Collector)
 */
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "COLLECTOR"),
  debtorModifyLimiter,
  validateRequest(debtorValidation.delete),
  debtorController.delete
);

module.exports = router;
