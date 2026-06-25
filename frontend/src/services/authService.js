// src/services/authService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ── Response handler ─────────────────────────────────────────────────────────
// Preserves the backend `code` field so callers can branch on specific errors
// e.g. code: "EMAIL_NOT_VERIFIED" in Login.jsx
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || !data.success) {
    const err = new Error(data.message || 'Something went wrong with the request.');
    err.code   = data.code;   // e.g. "EMAIL_NOT_VERIFIED"
    err.status = response.status;
    throw err;
  }
  return data;
};

// ── NATIVE AUTHENTICATION ────────────────────────────────────────────────────

export const login = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await handleResponse(response);
  return data.data;
};

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await handleResponse(response);
  // Returns { message } only — no token, user must verify email first
  return data.data;
};

export const logout = async () => {
  const token = localStorage.getItem('accessToken');
  try {
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (_) {
    // Never block a local logout on a network error
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const getMe = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await handleResponse(response);
  return data.data;
};

// ── EMAIL VERIFICATION ───────────────────────────────────────────────────────

export const verifyEmail = async (token) => {
  const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
};

export const resendVerificationEmail = async (email) => {
  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

// ── GOOGLE AUTHENTICATION ────────────────────────────────────────────────────

export const handleGoogleAuth = async ({ token }) => {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }), // must be a JWT ID Token
  });
  const data = await handleResponse(response);

  localStorage.setItem('accessToken', data.data.accessToken);
  if (data.data.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);

  return data.data;
};

// ── PASSWORD MANAGEMENT ──────────────────────────────────────────────────────

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
};

export const resetPassword = async ({ token, password }) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  return handleResponse(response);
};
