// src/modules/auth/auth.routes.js
const express    = require("express");
const router     = express.Router();
const authController  = require("./authController");
const authValidation  = require("./authValidation");
const validateRequest = require("../../middleware/validateRequest");
const authenticate    = require("../../middleware/authenticate");
const rateLimit  = require("express-rate-limit");

// ── Rate limiters ────────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: { success: false, message: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many requests, please try again later." },
});

// Stricter limiter for resend — prevents someone hammering the email endpoint
const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { success: false, message: "Too many resend requests. Please wait before trying again." },
});

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (sends verification email, no JWT returned)
 * @access  Public
 */
router.post(
  "/register",
  authLimiter,
  validateRequest(authValidation.register),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (blocked if email not verified)
 * @access  Public
 */
router.post(
  "/login",
  authLimiter,
  validateRequest(authValidation.login),
  authController.login
);

/**
 * @route   GET /api/auth/verify-email?token=<token>
 * @desc    Verify email address via token link; redirects to /login?verified=true
 * @access  Public
 */
router.get("/verify-email", authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email (max 3/hour per IP)
 * @access  Public
 */
router.post("/resend-verification", resendLimiter, authController.resendVerification);

/**
 * @route   POST /api/auth/google
 * @access  Public
 */
router.post("/google", authLimiter, authController.googleLogin);

/**
 * @route   POST /api/auth/facebook
 * @access  Public
 */
router.post("/facebook", authLimiter, authController.facebookLogin);

/**
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
router.post(
  "/refresh-token",
  generalAuthLimiter,
  validateRequest(authValidation.refreshToken),
  authController.refreshToken
);

/**
 * @route   GET /api/auth/profile
 * @access  Private
 */
router.get("/profile", authenticate, authController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password",  authLimiter, authController.resetPassword);

module.exports = router;
