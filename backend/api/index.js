// index.js

require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const errorHandler = require("../src/middleware/errorHandler");
const authRoutes = require("../src/modules/auth/authRoutes");
const debtorRoutes = require("../src/modules/debtor/debtorRoutes");
const whatsappRoutes = require("../src/modules/whatsapp/whatsappRoutes");
const debtRoutes = require("../src/modules/debt/debtRoutes");
const mpesaRoutes = require("../src/modules/mpesa/mpesa.routes");
const aiRoutes = require("../src/modules/ai/aiRoutes");
const reminderRoutes = require("../src/modules/ai/reminderRoutes");
const notificationRoutes = require("../src/modules/notification/notificationRoutes");
const walletRoutes = require("../src/modules/wallet/walletRoutes");
const withdrawalRoutes = require("../src/modules/wallet/withdrawalRoutes");
const accountRoutes = require("../src/modules/account/accountRoutes");

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security middleware - configured to allow API usage from your frontend
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Robust CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.CORS_ORIGIN
    ].filter(Boolean), // Removes undefined if CORS_ORIGIN isn't set in .env
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/debtors", debtorRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/mpesa", mpesaRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", reminderRoutes);
app.use("/api/notifications", notificationRoutes); 
app.use("/api/wallet", walletRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/account", accountRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Initialize only in non-serverless environments
if (process.env.VERCEL !== "1") {
  require("../src/modules/ai/reminderScheduler");
  console.log("✓ AI Reminder Scheduler initialized");
}

module.exports = app;

