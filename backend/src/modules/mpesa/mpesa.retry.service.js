const prisma = require("../../config/database");
const mpesaService = require("./mpesa.service");
const whatsappService = require("../whatsapp/whatsappService");
const phoneHelper = require("../utils/phoneHelper");
const logger = require("../../config/gemini").getLogger();

/**
 * M-Pesa Retry Service
 * Handles retry logic for failed, cancelled, or timed-out STK push transactions
 */
class MpesaRetryService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelays = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000]; // 5min, 15min, 1hr
  }

  /**
   * Process failed transactions for retry
   * @param {Number} maxAttempts - Maximum retry attempts (default: 3)
   * @returns {Promise<Object>} Retry statistics
   */
  async processFailedTransactions(maxAttempts = 3) {
    try {
      logger.info("Processing failed M-Pesa transactions for retry");

      // Get transactions eligible for retry
      const failedTransactions = await prisma.mpesaTransaction.findMany({
        where: {
          status: {
            in: ["FAILED", "CANCELLED", "TIMEOUT"],
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
          },
        },
        include: {
          // We don't have relations set up, so we'll fetch separately
        },
        take: 50, // Process in batches
      });

      const stats = {
        total: failedTransactions.length,
        retried: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
      };

      for (const transaction of failedTransactions) {
        // Count retries by checking logs
        const retryCount = await this.getRetryCount(transaction.id);

        if (retryCount >= maxAttempts) {
          logger.debug("Max retries reached for transaction", {
            transactionId: transaction.id,
            retryCount,
          });
          stats.skipped++;
          continue;
        }

        // Calculate wait time based on retry count
        const waitTime = this.retryDelays[retryCount] || this.retryDelays[2];
        const timeSinceCreation = Date.now() - transaction.createdAt.getTime();

        if (timeSinceCreation < waitTime) {
          logger.debug("Too soon to retry transaction", {
            transactionId: transaction.id,
            timeSinceCreation,
            waitTime,
          });
          stats.skipped++;
          continue;
        }

        // Attempt retry
        const retryResult = await this.retryTransaction(transaction);

        if (retryResult.success) {
          stats.successful++;
        } else {
          stats.failed++;
        }
        stats.retried++;

        // Add delay between retries to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      logger.info("Failed transaction processing complete", stats);
      return stats;
    } catch (error) {
      logger.error("processFailedTransactions failed", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Retry a specific transaction
   * @param {Object} transaction - Transaction record
   * @returns {Promise<Object>} Retry result
   */
  async retryTransaction(transaction) {
    try {
      logger.info("Retrying M-Pesa transaction", {
        transactionId: transaction.id,
        phone: transaction.phone,
        amount: transaction.amount,
      });

      // Get debtor info
      const debtor = await prisma.debtor.findUnique({
        where: { id: transaction.debtorId },
      });

      if (!debtor) {
        logger.error("Debtor not found for retry", {
          transactionId: transaction.id,
          debtorId: transaction.debtorId,
        });
        return { success: false, reason: "Debtor not found" };
      }

      // Validate phone
      if (!phoneHelper.isValidKenyanPhone(transaction.phone)) {
        logger.error("Invalid phone for retry", {
          transactionId: transaction.id,
          phone: transaction.phone,
        });
        return { success: false, reason: "Invalid phone number" };
      }

      // Notify debtor about retry
      const retryCount = await this.getRetryCount(transaction.id);
      const notificationMessage = `Dear ${debtor.name},\n\n📱 Retry #${
        retryCount + 1
      }: Payment request incoming!\n\nAmount: KES ${transaction.amount.toLocaleString()}\n\nPrevious attempt: ${this.getFailureReason(
        transaction,
      )}\n\nPlease check your phone and enter your M-Pesa PIN.`;

      await whatsappService.sendMessage(debtor.phone, notificationMessage);

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Trigger new STK push
      const stkResponse = await mpesaService.stkPush({
        phone: transaction.phone,
        amount: transaction.amount,
        reference: debtor.id,
      });

      // Create new transaction record
      const newTransaction = await prisma.mpesaTransaction.create({
        data: {
          checkoutRequestID: stkResponse.CheckoutRequestID,
          merchantRequestID: stkResponse.MerchantRequestID,
          phone: transaction.phone,
          amount: transaction.amount,
          debtId: transaction.debtId,
          debtorId: transaction.debtorId,
          userId: transaction.userId,
          status: "PENDING",
        },
      });

      // Log the retry
      await prisma.log.create({
        data: {
          userId: transaction.userId,
          debtorId: transaction.debtorId,
          action: "STK Push Retry",
          details: {
            originalTransactionId: transaction.id,
            newTransactionId: newTransaction.id,
            newCheckoutRequestID: stkResponse.CheckoutRequestID,
            retryCount: retryCount + 1,
            amount: transaction.amount,
          },
        },
      });

      logger.info("Transaction retry successful", {
        originalTransactionId: transaction.id,
        newTransactionId: newTransaction.id,
        newCheckoutRequestID: stkResponse.CheckoutRequestID,
      });

      return {
        success: true,
        newTransactionId: newTransaction.id,
        checkoutRequestID: stkResponse.CheckoutRequestID,
      };
    } catch (error) {
      logger.error("retryTransaction failed", {
        transactionId: transaction.id,
        error: error.message,
      });

      // Log failed retry
      await prisma.log.create({
        data: {
          userId: transaction.userId,
          debtorId: transaction.debtorId,
          action: "STK Push Retry Failed",
          details: {
            transactionId: transaction.id,
            error: error.message,
          },
        },
      });

      return { success: false, reason: error.message };
    }
  }

  /**
   * Get retry count for a transaction
   * @private
   */
  async getRetryCount(transactionId) {
    const retryLogs = await prisma.log.findMany({
      where: {
        action: "STK Push Retry",
        details: {
          path: ["originalTransactionId"],
          equals: transactionId,
        },
      },
    });

    return retryLogs.length;
  }

  /**
   * Get user-friendly failure reason
   * @private
   */
  getFailureReason(transaction) {
    if (transaction.status === "CANCELLED") {
      return "Payment was cancelled";
    } else if (transaction.status === "TIMEOUT") {
      return "Request timed out";
    } else if (transaction.errorMessage) {
      return transaction.errorMessage;
    } else {
      return "Payment failed";
    }
  }

  /**
   * Mark transaction as permanently failed after max retries
   * @param {String} transactionId - Transaction ID
   */
  async markAsPermamentlyFailed(transactionId) {
    try {
      const transaction = await prisma.mpesaTransaction.findUnique({
        where: { id: transactionId },
        include: {
          // Fetch debtor info if relations exist
        },
      });

      if (!transaction) {
        return;
      }

      const retryCount = await this.getRetryCount(transactionId);

      if (retryCount >= this.maxRetries) {
        // Update status to indicate max retries reached
        await prisma.mpesaTransaction.update({
          where: { id: transactionId },
          data: {
            errorMessage: `Max retries (${this.maxRetries}) reached`,
          },
        });

        // Notify debtor with manual payment instructions
        if (transaction.debtorId) {
          const debtor = await prisma.debtor.findUnique({
            where: { id: transaction.debtorId },
          });

          if (debtor) {
            const fallbackMessage = `Dear ${debtor.name},\n\nWe've attempted to send you a payment request ${this.maxRetries} times without success.\n\nPlease pay manually:\n\n📱 M-Pesa Paybill: 522533\nAccount: ${debtor.id}\nAmount: KES ${transaction.amount.toLocaleString()}\n\n🏦 Bank: Equity Bank\nAccount: 0123456789\nReference: ${debtor.id}\n\nThank you!`;

            await whatsappService.sendMessage(debtor.phone, fallbackMessage);

            await prisma.log.create({
              data: {
                userId: transaction.userId,
                debtorId: transaction.debtorId,
                action: "Max STK Retries Reached",
                details: {
                  transactionId,
                  retryCount: this.maxRetries,
                  amount: transaction.amount,
                },
              },
            });
          }
        }

        logger.info("Transaction marked as permanently failed", {
          transactionId,
          retryCount: this.maxRetries,
        });
      }
    } catch (error) {
      logger.error("markAsPermamentlyFailed failed", {
        transactionId,
        error: error.message,
      });
    }
  }

  /**
   * Get retry statistics
   * @returns {Promise<Object>} Statistics about retry-eligible transactions
   */
  async getRetryStats() {
    const failedCount = await prisma.mpesaTransaction.count({
      where: {
        status: { in: ["FAILED", "CANCELLED", "TIMEOUT"] },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const pendingCount = await prisma.mpesaTransaction.count({
      where: {
        status: "PENDING",
        createdAt: {
          lt: new Date(Date.now() - 10 * 60 * 1000), // Older than 10 minutes
        },
      },
    });

    return {
      failedTransactions: failedCount,
      stalePendingTransactions: pendingCount,
      eligibleForRetry: failedCount,
    };
  }
}

module.exports = new MpesaRetryService();
