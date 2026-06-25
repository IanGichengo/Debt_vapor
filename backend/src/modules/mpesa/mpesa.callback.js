const prisma = require("../../config/database");
const walletService = require("../wallet/walletService");
const geminiAgentService = require("../ai/geminiAgentService");
const whatsappService = require("../whatsapp/whatsappService");
const phoneHelper = require("../utils/phoneHelper");
const logger = require("../../config/gemini").getLogger();

const handleMpesaCallback = async (req, res) => {
  try {
    console.log("M-Pesa Callback:", JSON.stringify(req.body, null, 2));

    res.status(200).json({ ResultCode: 0 });

    const callback = req.body?.Body?.stkCallback;

    if (!callback) return;

    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = callback;

    const stkTransaction = await prisma.mpesaTransaction.findUnique({
      where: { checkoutRequestID: CheckoutRequestID },
    });

    if (!stkTransaction) {
      logger.warn("Transaction not found", { CheckoutRequestID });
      return;
    }

    // ===============================
    // SUCCESS FLOW
    // ===============================
    if (ResultCode === 0) {
      const items = CallbackMetadata.Item;

      const amount = items.find((i) => i.Name === "Amount")?.Value;
      const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;
      const phone = items.find((i) => i.Name === "PhoneNumber")?.Value;

      const normalizedPhone = phoneHelper.normalizeKenyanPhone(phone);

      const debtor = await prisma.debtor.findFirst({
        where: { phone: normalizedPhone },
      });

      // Update Mpesa log
      await prisma.mpesaTransaction.update({
        where: { id: stkTransaction.id },
        data: {
          status: "COMPLETED",
          receiptNumber: receipt,
        },
      });

      // ===============================
      // 🧠 CORE CHANGE: CREDIT WALLET
      // ===============================
      if (debtor) {
        await walletService.creditWallet({
          userId: debtor.userId,
          amount,
          reference: receipt,
        });

        logger.info("Wallet credited", {
          userId: debtor.userId,
          amount,
          receipt,
        });
      }

      // Optional WhatsApp confirmation
      if (debtor) {
        await whatsappService.sendMessage(
          debtor.phone,
          `Payment of KES ${amount} received. Receipt: ${receipt}.`
        );
      }

      return;
    }

    // ===============================
    // FAILURE FLOW
    // ===============================
    await prisma.mpesaTransaction.update({
      where: { id: stkTransaction.id },
      data: {
        status: ResultCode === 1032 ? "CANCELLED" : "FAILED",
        errorMessage: ResultDesc,
      },
    });
  } catch (error) {
    logger.error("Mpesa callback error", {
      error: error.message,
    });
  }
};

module.exports = { handleMpesaCallback };
