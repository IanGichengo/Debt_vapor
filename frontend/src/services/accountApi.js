// src/services/accountApi.js
// Matches the project's fetch-based pattern in authService.js

import { API_URL } from "../config/api";

const ACCOUNT_API = `${API_URL}/api/account`;

// ============================================
// HELPERS
// ============================================

/** Pulls the Bearer token from localStorage (same as authService) */
const getToken = () => localStorage.getItem("accessToken");

/**
 * Shared response handler — throws a plain Error with the server
 * message so hooks can catch it via err.message.
 */
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

/**
 * Authenticated JSON request (GET / PATCH / DELETE).
 * For multipart uploads use authenticatedFormRequest instead.
 */
const authRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  return handleResponse(response);
};

/**
 * Authenticated multipart/form-data request (avatar upload).
 * Do NOT set Content-Type — the browser sets it with the boundary.
 */
const authFormRequest = async (path, formData, method = "POST") => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });
  return handleResponse(response);
};

// ============================================
// PROFILE
// ============================================

/** Fetch logged-in user profile + wallet balance */
export const fetchProfile = async () => {
  const data = await authRequest("/account/me");
  return data.data;
};

/** Update name and/or email */
export const updateProfile = async (payload) => {
  const data = await authRequest("/account/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.data;
};

/** Change password — LOCAL accounts only */
export const changePassword = async (payload) => {
  const data = await authRequest("/account/me/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data;
};

// ============================================
// AVATAR
// ============================================

/**
 * Upload a new avatar photo.
 * @param {File} file
 */
export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append("avatar", file);
  const data = await authFormRequest("/account/me/avatar", form, "POST");
  return data.data;
};

/** Remove the current avatar */
export const deleteAvatar = async () => {
  const data = await authRequest("/account/me/avatar", { method: "DELETE" });
  return data.data;
};

// ============================================
// WALLET
// ============================================

/** Full wallet object + transaction history */
export const fetchWallet = async () => {
  const data = await authRequest("/wallet");
  return data.data;
};

/** Lightweight balance-only check */
export const fetchWalletBalance = async () => {
  const data = await authRequest("/wallet/balance");
  return data.balance;
};

/**
 * Paginated transaction history.
 * @param {number} page
 * @param {number} limit
 */
export const fetchTransactions = async (page = 1, limit = 10) => {
  const data = await authRequest(
    `/wallet/transactions?page=${page}&limit=${limit}`
  );
  return { transactions: data.data, pagination: data.pagination };
};

// ============================================
// WITHDRAWALS
// ============================================

/**
 * Submit a withdrawal request.
 * @param {{ amount: number, phone: string, reason?: string }} payload
 */
export const requestWithdrawal = async (payload) => {
  const data = await authRequest("/withdrawals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
};

/** Get logged-in user's withdrawal history */
export const fetchWithdrawals = async () => {
  const data = await authRequest("/withdrawals");
  return data.data;
};
