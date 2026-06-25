const Joi = require("joi");

/**
 * Validation schemas for debtor endpoints
 */
const debtorValidation = {
  /**
   * Validation for creating a new debtor
   */
  create: {
    body: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name must not exceed 100 characters",
      }),
      phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .required()
        .messages({
          "string.empty": "Phone number is required",
          "string.pattern.base":
            "Phone number must be a valid international format (e.g., +254712345678)",
        }),
      email: Joi.string().email().optional().allow("").messages({
        "string.email": "Email must be a valid email address",
      }),
      nationalId: Joi.string().min(5).max(20).optional().allow("").messages({
        "string.min": "National ID must be at least 5 characters long",
        "string.max": "National ID must not exceed 20 characters",
      }),
      status: Joi.string()
        .valid("active", "inactive", "suspended")
        .optional()
        .messages({
          "any.only": "Status must be one of: active, inactive, suspended",
        }),
    }),
  },

  /**
   * Validation for updating an existing debtor
   */
  update: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        "string.empty": "Debtor ID is required",
        "string.guid": "Debtor ID must be a valid UUID",
      }),
    }),
    body: Joi.object({
      name: Joi.string().min(2).max(100).optional().messages({
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name must not exceed 100 characters",
      }),
      phone: Joi.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
          "string.pattern.base":
            "Phone number must be a valid international format (e.g., +254712345678)",
        }),
      email: Joi.string().email().optional().allow("").messages({
        "string.email": "Email must be a valid email address",
      }),
      nationalId: Joi.string().min(5).max(20).optional().allow("").messages({
        "string.min": "National ID must be at least 5 characters long",
        "string.max": "National ID must not exceed 20 characters",
      }),
      status: Joi.string()
        .valid("active", "inactive", "suspended")
        .optional()
        .messages({
          "any.only": "Status must be one of: active, inactive, suspended",
        }),
    })
      .min(1)
      .messages({
        "object.min": "At least one field must be provided for update",
      }),
  },

  /**
   * Validation for getting a single debtor by ID
   */
  getById: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        "string.empty": "Debtor ID is required",
        "string.guid": "Debtor ID must be a valid UUID",
      }),
    }),
    query: Joi.object({
      include: Joi.string()
        .valid("debts", "reminders", "paymentPlans", "logs", "all")
        .optional()
        .messages({
          "any.only":
            "Include must be one of: debts, reminders, paymentPlans, logs, all",
        }),
    }),
  },

  /**
   * Validation for deleting a debtor
   */
  delete: {
    params: Joi.object({
      id: Joi.string().uuid().required().messages({
        "string.empty": "Debtor ID is required",
        "string.guid": "Debtor ID must be a valid UUID",
      }),
    }),
  },

  /**
   * Validation for getting all debtors with filters and pagination
   */
  getAll: {
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
          "number.max": "Limit must not exceed 100",
        }),
      search: Joi.string().optional().allow("").messages({
        "string.base": "Search must be a string",
      }),
      status: Joi.string()
        .valid("active", "inactive", "suspended")
        .optional()
        .messages({
          "any.only": "Status must be one of: active, inactive, suspended",
        }),
      sortBy: Joi.string()
        .valid("name", "createdAt", "updatedAt")
        .optional()
        .default("createdAt")
        .messages({
          "any.only": "Sort by must be one of: name, createdAt, updatedAt",
        }),
      sortOrder: Joi.string()
        .valid("asc", "desc")
        .optional()
        .default("desc")
        .messages({
          "any.only": "Sort order must be one of: asc, desc",
        }),
    }),
  },
};

module.exports = debtorValidation;
