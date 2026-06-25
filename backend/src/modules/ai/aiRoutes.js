const express = require("express");
const router = express.Router();
const aiController = require("./aiController");
const webhookController = require("./webhookController");
const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validateRequest = require("../../middleware/validateRequest");
const {
  analyzeMessageSchema,
  generatePaymentPlanSchema,
  scheduleRemindersSchema,
  sendReminderSchema,
  testConnectionSchema,
} = require("./aiValidation");

/**
 * AI Routes
 * All routes except webhook require authentication
 */

// Webhook routes (no authentication for WhatsApp webhooks)
router.get("/webhook", webhookController.verifyWebhook.bind(webhookController));
router.post(
  "/webhook",
  webhookController.handleWebhook.bind(webhookController)
);

// Test connection (authenticated)
router.get(
  "/test",
  authenticate,
  aiController.testConnection.bind(aiController)
);

// Analyze message
router.post(
  "/analyze-message",
  authenticate,
  validateRequest(analyzeMessageSchema),
  aiController.analyzeMessage.bind(aiController)
);

// Generate payment plan
router.post(
  "/generate-payment-plan",
  authenticate,
  validateRequest(generatePaymentPlanSchema),
  aiController.generatePaymentPlan.bind(aiController)
);

// Schedule reminders for payment plan
router.post(
  "/schedule-reminders",
  authenticate,
  validateRequest(scheduleRemindersSchema),
  aiController.scheduleReminders.bind(aiController)
);

// Send reminder immediately
router.post(
  "/send-reminder",
  authenticate,
  validateRequest(sendReminderSchema),
  aiController.sendReminder.bind(aiController)
);

// Get pending reminders
router.get(
  "/pending-reminders",
  authenticate,
  aiController.getPendingReminders.bind(aiController)
);

// Admin only routes
router.post(
  "/trigger-scheduler",
  authenticate,
  authorize(["ADMIN"]),
  aiController.triggerScheduler.bind(aiController)
);

router.get(
  "/scheduler-status",
  authenticate,
  authorize(["ADMIN"]),
  aiController.getSchedulerStatus.bind(aiController)
);

module.exports = router;
