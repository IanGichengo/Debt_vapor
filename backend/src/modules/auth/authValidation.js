const Joi = require("joi");

const authValidation = {
  register: {
    body: Joi.object({
      name: Joi.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name must not exceed 100 characters",
      }),

      email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address",
      }),

      password: Joi.string()
        .min(8)
        .max(128)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
          "string.empty": "Password is required",
          "string.min": "Password must be at least 8 characters long",
          "string.max": "Password must not exceed 128 characters",
          "string.pattern.base":
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        }),

      role: Joi.string().valid("ADMIN", "COLLECTOR").optional().messages({
        "any.only": "Role must be either ADMIN or COLLECTOR",
      }),
    }),
  },

  login: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address",
      }),

      password: Joi.string().required().messages({
        "string.empty": "Password is required",
      }),
    }),
  },

  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        "string.empty": "Refresh token is required",
      }),
    }),
  },
};

module.exports = authValidation;
