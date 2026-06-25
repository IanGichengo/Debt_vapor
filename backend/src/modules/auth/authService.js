const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../config/database");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password, role = "COLLECTOR" }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      const error = new Error("User with this email already exists");
      error.status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        provider: "LOCAL",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const tokens = this.generateTokens(user);
    return { user, ...tokens };
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      const error = new Error(
        !user?.password
          ? "Please sign in using the social provider you registered with (Google/Facebook)."
          : "Invalid email or password"
      );
      error.status = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    const tokens = this.generateTokens(user);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  /**
   * Google Auth Login/Register
   */
  async googleLogin({ token }) {
    if (!token) {
      const error = new Error("Google token is required");
      error.status = 400;
      throw error;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          provider: "GOOGLE",
          providerId: googleId,
          role: "COLLECTOR",
        },
      });
    }

    const tokens = this.generateTokens(user);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  /**
   * Facebook Auth Login/Register
   */
  async facebookLogin({ accessToken, userID }) {
    if (!accessToken || !userID) {
      const error = new Error("Access token and User ID are required");
      error.status = 400;
      throw error;
    }

    const fbResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    const fbData = await fbResponse.json();

    if (fbData.error || !fbData.email) {
      const error = new Error("Invalid Facebook token or missing email permission");
      error.status = 401;
      throw error;
    }

    const { email, name, id: facebookId } = fbData;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          provider: "FACEBOOK",
          providerId: facebookId,
          role: "COLLECTOR",
        },
      });
    }

    const tokens = this.generateTokens(user);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  /**
   * Refresh access token
   * FIX: added avatarUrl and provider to select so the
   * refreshed session carries the same fields as getProfile.
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          provider: true,   // ← added
          avatarUrl: true,  // ← added
        },
      });

      if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }

      const tokens = this.generateTokens(user);
      return { user, ...tokens };
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        const err = new Error("Invalid or expired refresh token");
        err.status = 401;
        throw err;
      }
      throw error;
    }
  }

  /**
   * Get user profile
   * FIX: added avatarUrl and provider so the sidebar shows
   * the photo immediately after a page refresh, without needing
   * to visit My Account first.
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,   // ← added
        avatarUrl: true,  // ← added
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    return user;
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetTokenExp: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
    });
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      const error = new Error("Invalid or expired reset token");
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });
  }

  /**
   * Generate JWT tokens
   */
  generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();
