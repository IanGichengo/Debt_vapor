const Joi = require("joi");

const debtValidation = {
  // Create debt validation
  createDebt: {
    body: Joi.object({
      debtorId: Joi.string().uuid().required().messages({
        "string.empty": "Debtor ID is required",
        "string.guid": "Debtor ID must be a valid UUID",
      }),
      amount: Joi.number().positive().required().messages({
        "number.base": "Amount must be a number",
        "number.positive": "Amount must be a positive number",
        "any.required": "Amount is required",
      }),
      dueDate: Joi.date().iso().required().messages({
        "date.base": "Due date must be a valid date",
        "date.format": "Due date must be in ISO format",
        "any.required": "Due date is required",
      }),
      debtType: Joi.string()
        .valid("ONE_TIME", "INSTALLMENT")
        .optional()
        .default("ONE_TIME")
        .messages({
          "any.only": "Debt type must be either ONE_TIME or INSTALLMENT",
        }),
        
      // ⭐ NEW: Allow creditorName through validation
      creditorName: Joi.string().trim().required().messages({
        "string.empty": "Creditor name is required",
        "any.required": "Creditor name is required",
      }),
      
      // ⭐ NEW: Allow creditorType through validation
      creditorType: Joi.string()
        .valid("PERSON", "COMPANY")
        .optional()
        .default("COMPANY")
        .messages({
          "any.only": "Creditor type must be either PERSON or COMPANY",
        }),

      amountPaid: Joi.number().min(0).optional().default(0).messages({
        "number.base": "Amount paid must be a number",
        "number.min": "Amount paid cannot be negative",
      }),
      status: Joi.string()
        .valid("pending", "active", "completed", "cancelled")
        .optional()
        .default("pending")
        .messages({
          "any.only":
            "Status must be one of: pending, active, completed, cancelled",
        }),
    }),
  },

  // Get all debts validation
  getAllDebts: {
    query: Joi.object({
      page: Joi.number().integer().min(1).optional().default(1).messages({
        "number.base": "Page must be a number",
        "number.min": "Page must be at least 1",
      }),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .messages({
          "number.base": "Limit must be a number",
          "number.min": "Limit must be at least 1",
          "number.max": "Limit cannot exceed 100",
        }),
      search: Joi.string().optional().allow("").messages({
        "string.base": "Search must be a string",
      }),
      status: Joi.string()
        .valid("pending", "active", "completed", "cancelled")
        .optional()
        .messages({
          "any.only":
            "Status must be one of: pending, active, completed, cancelled",
        }),
      debtType: Joi.string()
        .valid("ONE_TIME", "INSTALLMENT")
        .optional()
        .messages({
          "any.only": "Debt type must be either ONE_TIME or INSTALLMENT",
        }),
      debtorId: Joi.string().uuid().optional().messages({
        "string.guid": "Debtor ID must be a valid UUID",
      }),
    }),
  },

  // Get all debts for dashboard (no pagination)
  getAllDebtsForDashboard: {
    query: Joi.object({
      // Optional: You can add filters for dashboard if needed
      startDate: Joi.date().iso().optional().messages({
        "date.base": "Start date must be a valid date",
        "date.format": "Start date must be in ISO format",
      }),
      endDate: Joi.date().iso().optional().messages({
        "date.base": "End date must be a valid date",
        "date.format": "End date must be in ISO format",
      }),
    }),
  },

  // Get bulk debts summary for multiple debtors
  getBulkDebtsSummary: {
    query: Joi.object({
      debtorIds: Joi.string()
        .required()
        .pattern(/^[a-fA-F0-9\-]+(?:,[a-fA-F0-9\-]+)*$/)
        .messages({
          "string.empty": "Debtor IDs are required",
          "string.pattern.base": "Debtor IDs must be a comma-separated list of UUIDs",
          "any.required": "Debtor IDs are required",
        }),
    }),
  },

  // Get dashboard statistics
  getDashboardStats: {
    query: Joi.object({
      period: Joi.string()
        .valid("today", "week", "month", "quarter", "year", "all")
        .optional()
        .default("month")
        .messages({
          "any.only": "Period must be one of: today, week, month, quarter, year, all",
        }),
      startDate: Joi.date().iso().optional().messages({
        "date.base": "Start date must be a valid date",
        "date.format": "Start date must be in ISO format",
      }),
      endDate: Joi.date().iso().optional().messages({
        "date.base": "End date must be a valid date",
        "date.format": "End date must be in ISO format",
      }),
    }),
  },

  // Get debt by ID validation
  getDebtById: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        "string.empty": "Debt ID is required",
        "string.guid": "Debt ID must be a valid UUID",
      }),
    }),
  },

  // Update debt validation
  updateDebt: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        "string.empty": "Debt ID is required",
        "string.guid": "Debt ID must be a valid UUID",
      }),
    }),
    body: Joi.object({
      debtorId: Joi.string().uuid().optional().messages({
        "string.guid": "Debtor ID must be a valid UUID",
      }),
      amount: Joi.number().positive().optional().messages({
        "number.base": "Amount must be a number",
        "number.positive": "Amount must be a positive number",
      }),
      amountPaid: Joi.number().min(0).optional().messages({
        "number.base": "Amount paid must be a number",
        "number.min": "Amount paid cannot be negative",
      }),
      dueDate: Joi.date().iso().optional().messages({
        "date.base": "Due date must be a valid date",
        "date.format": "Due date must be in ISO format",
      }),
      debtType: Joi.string()
        .valid("ONE_TIME", "INSTALLMENT")
        .optional()
        .messages({
          "any.only": "Debt type must be either ONE_TIME or INSTALLMENT",
        }),
        
      // ⭐ NEW: Allow updating creditorName
      creditorName: Joi.string().trim().optional().allow("", null),
      
      // ⭐ NEW: Allow updating creditorType
      creditorType: Joi.string().valid("PERSON", "COMPANY").optional(),

      status: Joi.string()
        .valid("pending", "active", "completed", "cancelled")
        .optional()
        .messages({
          "any.only":
            "Status must be one of: pending, active, completed, cancelled",
        }),
    })
      .min(1)
      .messages({
        "object.min": "At least one field must be provided for update",
      }),
  },

  // Delete debt validation
  deleteDebt: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        "string.empty": "Debt ID is required",
        "string.guid": "Debt ID must be a valid UUID",
      }),
    }),
  },

  // Record payment validation
  recordPayment: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        "string.empty": "Debt ID is required",
        "string.guid": "Debt ID must be a valid UUID",
      }),
    }),
    body: Joi.object({
      amount: Joi.number().positive().required().messages({
        "number.base": "Payment amount must be a number",
        "number.positive": "Payment amount must be a positive number",
        "any.required": "Payment amount is required",
      }),
      paymentDate: Joi.date().iso().optional().default(new Date().toISOString()).messages({
        "date.base": "Payment date must be a valid date",
        "date.format": "Payment date must be in ISO format",
      }),
      paymentMethod: Joi.string()
        .valid("cash", "mpesa", "bank_transfer", "cheque", "card")
        .optional()
        .default("mpesa")
        .messages({
          "any.only": "Payment method must be one of: cash, mpesa, bank_transfer, cheque, card",
        }),
      reference: Joi.string().optional().allow("").messages({
        "string.base": "Reference must be a string",
      }),
    }),
  },

  // Get debt statistics
  getDebtStats: {
    query: Joi.object({
      debtorId: Joi.string().uuid().optional().messages({
        "string.guid": "Debtor ID must be a valid UUID",
      }),
      startDate: Joi.date().iso().optional().messages({
        "date.base": "Start date must be a valid date",
        "date.format": "Start date must be in ISO format",
      }),
      endDate: Joi.date().iso().optional().messages({
        "date.base": "End date must be a valid date",
        "date.format": "End date must be in ISO format",
      }),
      status: Joi.string()
        .valid("pending", "active", "completed", "cancelled", "all")
        .optional()
        .default("all")
        .messages({
          "any.only":
            "Status must be one of: pending, active, completed, cancelled, all",
        }),
    }),
  },
};

module.exports = debtValidation;
