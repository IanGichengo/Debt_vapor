const mpesaService = require("./mpesa.service");
const mpesaRetryService = require("./mpesa.retry.service");
const prisma = require("../../config/database");

const initiatePayment = async (req, res, next) => {
  try {
    const { phone, amount, reference } = req.body;

    const response = await mpesaService.stkPush({
      phone,
      amount,
      reference,
    });

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Get M-Pesa transaction status
 * GET /api/mpesa/transaction/:checkoutRequestID
 */
const getTransactionStatus = async (req, res, next) => {
  try {
    const { checkoutRequestID } = req.params;

    const transaction = await prisma.mpesaTransaction.findUnique({
      where: { checkoutRequestID },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get debtor's M-Pesa transactions
 * GET /api/mpesa/transactions/debtor/:debtorId
 */
const getDebtorTransactions = async (req, res, next) => {
  try {
    const { debtorId } = req.params;
    const userId = req.user.id;

    // Verify debtor belongs to user
    const debtor = await prisma.debtor.findFirst({
      where: {
        id: debtorId,
        userId: userId,
      },
    });

    if (!debtor) {
      return res.status(404).json({
        success: false,
        message: "Debtor not found",
      });
    }

    const transactions = await prisma.mpesaTransaction.findMany({
      where: { debtorId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retry failed transaction
 * POST /api/mpesa/retry/:transactionId
 */
const retryTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    // Get transaction and verify ownership
    const transaction = await prisma.mpesaTransaction.findFirst({
      where: {
        id: transactionId,
        userId: userId,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (!["FAILED", "CANCELLED", "TIMEOUT"].includes(transaction.status)) {
      return res.status(400).json({
        success: false,
        message:
          "Only failed, cancelled, or timed-out transactions can be retried",
      });
    }

    const result = await mpesaRetryService.retryTransaction(transaction);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Transaction retry initiated successfully",
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Transaction retry failed",
        reason: result.reason,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Process all failed transactions (Admin only)
 * POST /api/mpesa/process-failed
 */
const processFailedTransactions = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { maxAttempts = 3 } = req.body;

    const stats =
      await mpesaRetryService.processFailedTransactions(maxAttempts);

    res.status(200).json({
      success: true,
      message: "Failed transactions processed",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get retry statistics (Admin only)
 * GET /api/mpesa/retry-stats
 */
const getRetryStats = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const stats = await mpesaRetryService.getRetryStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiatePayment,
  getTransactionStatus,
  getDebtorTransactions,
  retryTransaction,
  processFailedTransactions,
  getRetryStats,
};
