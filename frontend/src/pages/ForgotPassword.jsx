import React from "react"
import axios from "axios"
import { useState } from "react"

const ForgotPassword = () => {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    const handleSubmit = async (e) => {
        const API_URL=import.meta.env.VITE_API_URL;
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const res = await axios.post(
                `${API_URL}/auth/forgot-password`,
                {email}
            );

            setMessage(res.data.message);

            setEmail("");
        } catch (error) {
            setError("Unable to send reset link. Try again");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form 
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
        >
            <h2 className="text-2xl font-bold text-center text-blue-700">
                Reset your password
            </h2>

            <p className="text-sm text-gray-600 mb-6 text-center">
                Enter your email and we'll send you a password reset link.
            </p>

            <input 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email" 
                placeholder="Enter your email"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-600"
            />

            {message && (
                <p className="text-green-600 text-sm mt-3 text-center">
                    {message}
                </p>
            )}

            {error && (
                <p className="text-red-600 text-sm mt-3 text-center">
                    {error}
                </p>
            )}

            <button 
                disabled={loading}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
            >
                {loading ? "Sending..." : "Send Reset Link"}
            </button>

        </form>
    </div>
  )
}

export default ForgotPassword