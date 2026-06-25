const Joi = require("joi");

/**
 * Validation schemas for AI endpoints
 */

const analyzeMessageSchema = Joi.object({
  debtorId: Joi.string().required().messages({
    "any.required": "Debtor ID is required",
    "string.empty": "Debtor ID cannot be empty",
  }),
  message: Joi.string().min(1).max(1000).required().messages({
    "any.required": "Message is required",
    "string.empty": "Message cannot be empty",
    "string.min": "Message must be at least 1 character",
    "string.max": "Message cannot exceed 1000 characters",
  }),
});

const generatePaymentPlanSchema = Joi.object({
  debtorId: Joi.string().required().messages({
    "any.required": "Debtor ID is required",
  }),
  debtId: Joi.string().required().messages({
    "any.required": "Debt ID is required",
  }),
  analysis: Joi.object({
    paymentIntent: Joi.string().valid(
      "full_payment",
      "partial_payment",
      "payment_plan_request",
      "dispute",
      "hardship",
      "no_intent",
      "inquiry"
    ),
    proposedAmount: Joi.number().min(0).allow(null),
    proposedFrequency: Joi.string()
      .valid("weekly", "bi-weekly", "monthly", "one-time")
      .allow(null),
    emotionalTone: Joi.string().valid(
      "cooperative",
      "frustrated",
      "angry",
      "desperate",
      "neutral",
      "confused"
    ),
    financialCapability: Joi.string().valid(
      "strong",
      "moderate",
      "weak",
      "unknown"
    ),
  }).optional(),
});

const generateReminderSchema = Joi.object({
  reminderId: Joi.string().required().messages({
    "any.required": "Reminder ID is required",
  }),
});

const scheduleRemindersSchema = Joi.object({
  paymentPlanId: Joi.string().required().messages({
    "any.required": "Payment plan ID is required",
  }),
});

const sendReminderSchema = Joi.object({
  reminderId: Joi.string().required().messages({
    "any.required": "Reminder ID is required",
  }),
});

const testConnectionSchema = Joi.object({
  testMessage: Joi.string().max(100).optional().default("Hello, Gemini!"),
});

module.exports = {
  analyzeMessageSchema,
  generatePaymentPlanSchema,
  generateReminderSchema,
  scheduleRemindersSchema,
  sendReminderSchema,
  testConnectionSchema,
};
