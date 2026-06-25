/**
 * Middleware factory to validate request data using Joi schemas
 * @param {Object} schema - Joi schema object with body, params, and/or query
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors, not just the first one
      allowUnknown: true, // Allow unknown keys that will be ignored
      stripUnknown: true, // Remove unknown keys from the validated data
    };

    const toValidate = {};
    const schemaObject = {};

    if (schema.body) {
      toValidate.body = req.body;
      schemaObject.body = schema.body;
    }

    if (schema.params) {
      toValidate.params = req.params;
      schemaObject.params = schema.params;
    }

    if (schema.query) {
      toValidate.query = req.query;
      schemaObject.query = schema.query;
    }

    const Joi = require("joi");
    const schemaToValidate = Joi.object(schemaObject);

    const { error, value } = schemaToValidate.validate(
      toValidate,
      validationOptions
    );

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    // Replace request data with validated data
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;

    next();
  };
};

module.exports = validateRequest;
