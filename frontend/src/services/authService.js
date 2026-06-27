// src/services/authService.js

import { API_URL } from "../config/api";

const AUTH_API = `${API_URL}/api/auth`;

// ── Response handler ─────────────────────────────────────────────────────────
// Preserves the backend `code` field so callers can branch on specific errors
// e.g. code: "EMAIL_NOT_VERIFIED" in Login.jsx
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok || !data.success) {
    const err = new Error(
      data.message || "Something went wrong with the request."
    );

    err.code = data.code; // e.g. "EMAIL_NOT_VERIFIED"
    err.status = response.status;

    throw err;
  }

  return data;
};

// ── NATIVE AUTHENTICATION ────────────────────────────────────────────────────

export const login = async (credentials) => {
  const response = await fetch(`${AUTH_API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await handleResponse(response);
  return data.data;
};

export const register = async (userData) => {
  const response = await fetch(`${AUTH_API}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await handleResponse(response);

  // Returns { message } only — no token, user must verify email first
  return data.data;
};

export const logout = async () => {
  const token = localStorage.getItem("accessToken");

  try {
    if (token) {
      await fetch(`${AUTH_API}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (_) {
    // Never block a local logout on a network error
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

export const getMe = async () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("No token found");
  }

  const response = await fetch(`${AUTH_API}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await handleResponse(response);
  return data.data;
};

// ── EMAIL VERIFICATION ───────────────────────────────────────────────────────

export const verifyEmail = async (token) => {
  const response = await fetch(
    `${AUTH_API}/verify-email?token=${token}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return handleResponse(response);
};

export const resendVerificationEmail = async (email) => {
  const response = await fetch(`${AUTH_API}/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return handleResponse(response);
};

// ── GOOGLE AUTHENTICATION ────────────────────────────────────────────────────

export const handleGoogleAuth = async ({ token }) => {
  const response = await fetch(`${AUTH_API}/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token, // Google JWT ID token
    }),
  });

  const data = await handleResponse(response);

  localStorage.setItem("accessToken", data.data.accessToken);

  if (data.data.refreshToken) {
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }

  return data.data;
};

// ── PASSWORD MANAGEMENT ──────────────────────────────────────────────────────

export const forgotPassword = async (email) => {
  const response = await fetch(`${AUTH_API}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return handleResponse(response);
};

export const resetPassword = async ({ token, password }) => {
  const response = await fetch(`${AUTH_API}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      password,
    }),
  });

  return handleResponse(response);
};
