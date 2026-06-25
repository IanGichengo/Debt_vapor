import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    const API_URL = import.meta.env.VITE_API_URL;
    e.preventDefault();

    if(!token) {
      setError("Invalid or missing reset token");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/auth/reset-password`,
        {
          token,
          password
        }
      );

      setMessage("Password reset successful. Redirecting to login...");

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login")
      }, 2000);
    } catch (error) {
      setError("Reset Link is invalid or expired");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-1 text-center text-blue-700">
          Set New Password
        </h2>

        <p className="text-sm text-gray-600 mb-3 text-center">
          Enter your new password below. Make sure it is strong and secure.
        </p>

        {/* New Password */}
        <div className="mb-2">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.password)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            required
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        {message && (
          <p className="text-green-600 text-sm mb-3">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition font-medium"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
