const { GoogleGenerativeAI } = require("@google/generative-ai");
const winston = require("winston");

// Configure Winston logger for Gemini operations
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/gemini-error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "logs/gemini-combined.log" }),
  ],
});

// Also log to console in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

/**
 * Gemini AI Configuration Service
 * Provides centralized configuration and client instance for Google Gemini AI
 */
class GeminiConfig {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;

    if (!this.apiKey) {
      logger.error("GEMINI_API_KEY not found in environment variables");
      throw new Error("GEMINI_API_KEY is required for Gemini AI integration");
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);

    // Configuration options
    this.config = {
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      temperature: parseFloat(process.env.GEMINI_TEMPERATURE || "0.7"),
      maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || "2048"),
      topP: parseFloat(process.env.GEMINI_TOP_P || "0.95"),
      topK: parseInt(process.env.GEMINI_TOP_K || "40"),
    };

    // Rate limiting configuration
    this.rateLimit = {
      maxRequestsPerMinute: parseInt(process.env.GEMINI_RATE_LIMIT || "60"),
      retryAttempts: parseInt(process.env.GEMINI_RETRY_ATTEMPTS || "3"),
      retryDelay: parseInt(process.env.GEMINI_RETRY_DELAY || "1000"), // milliseconds
    };

    logger.info("Gemini AI configuration initialized", {
      model: this.config.model,
      temperature: this.config.temperature,
      maxOutputTokens: this.config.maxOutputTokens,
    });
  }

  /**
   * Get configured Gemini model instance
   * @param {Object} customConfig - Optional custom configuration to override defaults
   * @returns {Object} Gemini model instance
   */
  getModel(customConfig = {}) {
    const generationConfig = {
      temperature: customConfig.temperature || this.config.temperature,
      maxOutputTokens:
        customConfig.maxOutputTokens || this.config.maxOutputTokens,
      topP: customConfig.topP || this.config.topP,
      topK: customConfig.topK || this.config.topK,
    };

    const modelName = customConfig.model || this.config.model;

    logger.debug("Creating Gemini model instance", {
      modelName,
      generationConfig,
    });

    return this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
    });
  }

  /**
   * Get logger instance
   * @returns {Object} Winston logger
   */
  getLogger() {
    return logger;
  }

  /**
   * Get rate limit configuration
   * @returns {Object} Rate limit settings
   */
  getRateLimitConfig() {
    return this.rateLimit;
  }

  /**
   * Validate API connection
   * @returns {Promise<Boolean>} True if connection is valid
   */
  async validateConnection() {
    try {
      const model = this.getModel();
      const result = await model.generateContent("Hello");
      const response = await result.response;
      logger.info("Gemini API connection validated successfully");
      return true;
    } catch (error) {
      logger.error("Gemini API connection validation failed", {
        error: error.message,
      });
      return false;
    }
  }
}

// Export singleton instance
module.exports = new GeminiConfig();
