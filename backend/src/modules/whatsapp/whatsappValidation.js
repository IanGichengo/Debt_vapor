const Joi = require("joi");

const sendMessageSchema = Joi.object({
  to: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be 10-15 digits without special characters",
      "any.required": "Phone number is required",
    }),
  message: Joi.string().min(1).max(4096).required().messages({
    "string.min": "Message cannot be empty",
    "string.max": "Message cannot exceed 4096 characters",
    "any.required": "Message is required",
  }),
  previewUrl: Joi.boolean().optional(),
});

//  UPDATED: No message required - Gemini AI generates it automatically!
const sendToDebtorSchema = Joi.object({
  // DebtorId comes from URL params
  // Gemini AI will automatically:
  // 1. Fetch debtor and debt information
  // 2. Calculate days until due
  // 3. Check for payment plans
  // 4. Generate contextual, personalized message
  // 5. Send via WhatsApp
});

const sendTemplateSchema = Joi.object({
  to: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required(),
  templateName: Joi.string().required(),
  languageCode: Joi.string().default("en"),
  components: Joi.array().optional(),
});

const sendBulkSchema = Joi.object({
  phoneNumbers: Joi.array()
    .items(Joi.string().pattern(/^[0-9]{10,15}$/))
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.min": "At least one phone number is required",
      "array.max": "Cannot send to more than 100 numbers at once",
    }),
  message: Joi.string().min(1).max(4096).required(),
});

const sendHelloSchema = Joi.object({
  to: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be 10-15 digits without special characters",
      "any.required": "Phone number is required",
    }),
});

module.exports = {
  sendMessageSchema,
  sendToDebtorSchema,
  sendTemplateSchema,
  sendBulkSchema,
  sendHelloSchema,
};
