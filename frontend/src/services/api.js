// src/services/api.js

import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

// Create a single axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Track if we're already redirecting to prevent loops
let isRedirecting = false;

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request setup error:", error);
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      const status = error.response.status;

      const isWhatsAppEndpoint =
        error.config?.url?.includes("/whatsapp/");

      // Handle expected errors quietly
      if (status === 404 || status === 429) {
        console.warn(
          `[Handled ${status}] ${error.config.url}: ${
            error.response.data?.message || "Handled"
          }`
        );

        return Promise.reject(error);
      }

      // Authentication handling
      if (status === 401) {
        const isAuthRequest =
          error.config?.url?.includes("/auth/login") ||
          error.config?.url?.includes("/auth/register") ||
          error.config?.url?.includes("/auth/signup") ||
          error.config?.url?.includes("/auth/google");

        if (
          !isAuthRequest &&
          !isWhatsAppEndpoint &&
          !isRedirecting
        ) {
          isRedirecting = true;

          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          const isOnAuthPage =
            window.location.pathname.includes("/login") ||
            window.location.pathname.includes("/register");

          if (!isOnAuthPage) {
            console.log(
              "Session expired. Redirecting to login..."
            );

            setTimeout(() => {
              window.location.href = "/login";
              isRedirecting = false;
            }, 100);
          } else {
            isRedirecting = false;
          }
        } else if (isWhatsAppEndpoint) {
          console.warn(
            "WhatsApp Provider Error (401): Check your API keys."
          );
        }
      }

      // Log real server errors
      if (status >= 500) {
        console.error(
          "Server Crash (500):",
          error.response.data
        );
      } else if (status === 403) {
        console.error(
          "Permission Denied (403):",
          error.response.data
        );
      }
    } else if (error.request) {
      console.error(
        "Network Error: No response from server. Is the backend running?"
      );
    } else {
      console.error("Axios Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
