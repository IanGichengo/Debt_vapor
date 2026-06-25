// src/modules/auth/authController.js
const crypto      = require("crypto");
const authService  = require("./authService");
const emailService = require("./emailService");
const prisma       = require("../../config/database");

// ── Disposable email blocklist ──────────────────────────────────────────────
// npm install disposable-email-domains
let disposableSet;
try {
  const disposableDomains = require("disposable-email-domains");
  disposableSet = new Set(disposableDomains);
} catch {
  // Package not installed — fall back to an empty set (frontend still blocks)
  disposableSet = new Set();
  console.warn("[Auth] disposable-email-domains not installed. Run: npm install disposable-email-domains");
}

function isDisposable(email) {
  const domain = email?.split("@")[1]?.toLowerCase();
  return domain ? disposableSet.has(domain) : false;
}

// ── Token helper ────────────────────────────────────────────────────────────
function generateVerifyToken() {
  return crypto.randomBytes(32).toString("hex");
}

// ============================================================
// CONTROLLERS
// ============================================================

class AuthController {
  /**
   * POST /api/auth/register
   * Creates an unverified user and sends a verification email.
   * User CANNOT log in until email is confirmed.
   */
  async register(req, res, next) {
    try {
      const { email } = req.body;

      // Server-side disposable email guard (client-side already checks, this is the real wall)
      if (isDisposable(email)) {
        return res.status(400).json({
          success: false,
          message: "Disposable email addresses are not permitted. Please use a work or personal email.",
        });
      }

      // Delegate user creation to authService (your existing logic unchanged)
      // authService.register must NOT set emailVerified — the schema default (false) handles it.
      const result = await authService.register(req.body);

      // Generate a verification token and stamp the user record
      const verifyToken        = generateVerifyToken();
      const verifyTokenExpiry  = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

      await prisma.user.update({
        where: { email },
        data:  { verifyToken, verifyTokenExpiry },
      });

      // Send the verification email via Resend
      await emailService.sendVerificationEmail({
        name:  result.name || req.body.name,
        email,
        token: verifyToken,
      });

      // Return success WITHOUT a JWT — user must verify first
      res.status(201).json({
        success: true,
        message: "Account created. Please check your email to verify before logging in.",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Blocks unverified LOCAL accounts. Google/Facebook accounts are pre-verified.
   */
  async login(req, res, next) {
    try {
      const { email } = req.body;

      // Check verification status before delegating to authService
      const user = await prisma.user.findUnique({ where: { email } });

      if (user && user.provider === "LOCAL" && !user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email address before logging in. Check your inbox for the verification link.",
          code:    "EMAIL_NOT_VERIFIED",
        });
      }

      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/verify-email?token=<token>
   * Marks the user as verified and redirects to /login?verified=true
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ success: false, message: "Verification token is required." });
      }

      const user = await prisma.user.findUnique({ where: { verifyToken: token } });

      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid verification link." });
      }

      if (user.verifyTokenExpiry < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Verification link has expired. Please request a new one.",
          code: "TOKEN_EXPIRED",
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified:    true,
          verifyToken:      null,
          verifyTokenExpiry: null,
        },
      });

      // Redirect the browser to login page with a success flag
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/resend-verification
   * Lets a user request a new verification email if their link expired.
   */
  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
      }

      const user = await prisma.user.findUnique({ where: { email } });

      // Always return success to prevent email enumeration
      if (!user || user.emailVerified || user.provider !== "LOCAL") {
        return res.status(200).json({
          success: true,
          message: "If that email exists and is unverified, a new link has been sent.",
        });
      }

      const verifyToken       = generateVerifyToken();
      const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data:  { verifyToken, verifyTokenExpiry },
      });

      await emailService.sendVerificationEmail({
        name:  user.name,
        email: user.email,
        token: verifyToken,
      });

      res.status(200).json({
        success: true,
        message: "If that email exists and is unverified, a new link has been sent.",
      });
    } catch (error) {
      next(error);
    }
  }

  // ── Existing handlers (unchanged) ─────────────────────────────────────────

  async googleLogin(req, res, next) {
    try {
      // Google-authenticated users are considered pre-verified
      const result = await authService.googleLogin(req.body);
      res.status(200).json({ success: true, message: "Google login successful", data: result });
    } catch (error) {
      next(error);
    }
  }

  async facebookLogin(req, res, next) {
    try {
      const result = await authService.facebookLogin(req.body);
      res.status(200).json({ success: true, message: "Facebook login successful", data: result });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json({ success: true, message: "Token refreshed successfully", data: result });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    // Stateless JWT — client drops its tokens.
    // If you add refresh-token storage to DB later, invalidate here.
    res.status(200).json({ success: true, message: "Logout successful. Please remove your tokens." });
  }

  async forgotPassword(req, res, next) {
    try {
      await authService.forgotPassword(req.body.email);
      res.status(200).json({ success: true, message: "If an account exists, a reset email has been sent." });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
