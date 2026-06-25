const prisma = require("../../config/database");
const geminiAgentService = require("./geminiAgentService");
const reminderService = require("./reminderService");
const whatsappService = require("../whatsapp/whatsappService");
const mpesaService = require("../mpesa/mpesa.service");
const phoneHelper = require("../utils/phoneHelper");
const logger = require("../../config/gemini").getLogger();

/**
 * AI Webhook Controller
 * Optimized for Conversational Payment Collection
 * Messages persisted to Message model (two-way chat history)
 * Reminder model reserved exclusively for scheduled reminders
 */
class AIWebhookController {
  async verifyWebhook(req, res) {
    try {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
      const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token";

      if (mode === "subscribe" && token === verifyToken) {
        logger.info("Webhook verified successfully");
        return res.status(200).send(challenge);
      }
      return res.status(403).json({ error: "Forbidden" });
    } catch (error) {
      logger.error("verifyWebhook error", { error: error.message });
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async handleWebhook(req, res) {
    try {
      res.status(200).send("OK");
      const { entry } = req.body;
      if (!entry || !entry.length) return;

      for (const item of entry) {
        const changes = item.changes || [];
        for (const change of changes) {
          if (change.field === "messages") {
            const value = change.value;
            if (value.messages && value.messages.length > 0) {
              for (const message of value.messages) {
                this.processMessage(message, value).catch((error) => {
                  logger.error("Message processing failed", {
                    messageId: message.id,
                    error: error.message,
                  });
                });
              }
            }
          }
        }
      }
    } catch (error) {
      logger.error("handleWebhook error", { error: error.message });
    }
  }

  async processMessage(message, value) {
    try {
      if (message.type !== "text") return;

      const from = message.from;
      const text = message.text.body;
      const waMessageId = message.id; // Meta's unique message ID

      const phoneVariants = [from, `+${from}`, `0${from.slice(3)}`];

      const debtor = await prisma.debtor.findFirst({
        where: { phone: { in: phoneVariants } },
        include: {
          debts: {
            where: { status: { in: ["pending", "active"] } },
            orderBy: { dueDate: "asc" },
          },
        },
      });

      if (!debtor) {
        logger.warn("Unknown debtor contacted via WhatsApp", { from });
        return;
      }

      // 1. PERSIST INBOUND MESSAGE → Message model (renders LEFT side, white bubble)
      //    waMessageId unique constraint prevents duplicate saves on Meta webhook retries
      await prisma.message.upsert({
        where: { waMessageId },
        update: {}, // Already saved — do nothing
        create: {
          debtorId: debtor.id,
          userId: debtor.userId,
          content: text,
          direction: "IN",
          status: "RECEIVED",
          channel: "WHATSAPP",
          waMessageId,
          timestamp: new Date(),
        },
      });

      const activeDebt = debtor.debts[0];
      if (!activeDebt) {
        await this.sendAndSaveAIResponse(
          debtor,
          `Hello ${debtor.name}, your account is currently clear. Thank you!`,
          "no_active_debt"
        );
        return;
      }

      // 2. AI Analysis
      const analysis = await geminiAgentService.analyzeDebtorMessage(
        text,
        debtor,
        activeDebt
      );

      // 3. Conversational Logic Flow
      switch (analysis.paymentIntent) {
        case "full_payment":
        case "partial_payment":
        case "payment_plan_request":
          await this.handlePaymentIntent(debtor, activeDebt, analysis);
          break;
        case "inquiry":
          await this.handleInquiry(debtor, activeDebt, analysis);
          break;
        default:
          await this.handleGeneralResponse(debtor, activeDebt, analysis);
          break;
      }
    } catch (error) {
      logger.error("processMessage error", { error: error.message });
    }
  }

  /**
   * Only triggers STK if a specific amount is confirmed.
   * Otherwise, asks the debtor to specify.
   */
  async handlePaymentIntent(debtor, debt, analysis) {
    const totalBalance = debt.amount - debt.amountPaid;
    const proposedAmount = analysis.proposedAmount;

    if (proposedAmount && proposedAmount > 0) {
      const desc =
        proposedAmount >= totalBalance
          ? "Full Debt Settlement"
          : "Partial Debt Payment";
      const msg = `Perfect, ${debtor.name}. I am triggering an M-Pesa prompt for KES ${proposedAmount.toLocaleString()} to your phone now. Please enter your PIN to complete this.`;

      await this.sendAndSaveAIResponse(debtor, msg, "stk_push_triggered");
      await this.triggerSTKPush(debtor, debt, proposedAmount, desc);
    } else {
      const msg = `Glad to hear that, ${debtor.name}! Your total outstanding balance is *KES ${totalBalance.toLocaleString()}*.\n\nWould you like to:\n1. Pay the *Full Amount*\n2. Pay a *Partial Amount*\n\nPlease reply with the amount you wish to pay (e.g., "Pay 5000").`;

      await this.sendAndSaveAIResponse(debtor, msg, "awaiting_amount_confirmation");
    }
  }

  async handleInquiry(debtor, debt, analysis) {
    const outstanding = debt.amount - debt.amountPaid;
    const msg = `*Account Summary for ${debtor.name}*\n------------------\nBalance: KES ${outstanding.toLocaleString()}\nDue Date: ${new Date(debt.dueDate).toLocaleDateString()}\n\nTo pay, simply reply with the amount you want to settle, e.g Pay 10,000`;
    await this.sendAndSaveAIResponse(debtor, msg, "inquiry_response");
  }

  async handleGeneralResponse(debtor, debt, analysis) {
    const msg =
      analysis.responseMessage ||
      `Hello ${debtor.name}, how can we help you settle your balance of KES ${(debt.amount - debt.amountPaid).toLocaleString()} today?`;
    await this.sendAndSaveAIResponse(debtor, msg, "general_ai_response");
  }

  /**
   * Send WhatsApp message + persist to Message model (renders RIGHT side, blue bubble)
   */
  async sendAndSaveAIResponse(debtor, messageText, intentType) {
    try {
      await whatsappService.sendMessage(debtor.phone, messageText);

      await prisma.message.create({
        data: {
          debtorId: debtor.id,
          userId: debtor.userId,
          content: messageText,
          direction: "OUT",
          status: "SENT",
          channel: "WHATSAPP",
          waMessageId: null, // Outbound messages have no Meta message ID at send time
          timestamp: new Date(),
          // intentType stored conceptually — add a metadata Json field to
          // Message model later if you need to query by intent
        },
      });
    } catch (err) {
      logger.error("sendAndSaveAIResponse failed", { error: err.message });
    }
  }

  async triggerSTKPush(debtor, debt, amount, description) {
    try {
      const normalizedPhone = phoneHelper.formatForMpesa(debtor.phone);
      const stkResponse = await mpesaService.stkPush({
        phone: normalizedPhone,
        amount: Math.round(amount),
        reference: debtor.id.substring(0, 12),
      });

      await prisma.mpesaTransaction.create({
        data: {
          checkoutRequestID: stkResponse.CheckoutRequestID,
          merchantRequestID: stkResponse.MerchantRequestID,
          phone: normalizedPhone,
          amount: parseFloat(amount),
          debtId: debt.id,
          debtorId: debtor.id,
          userId: debtor.userId,
          status: "PENDING",
        },
      });

      logger.info("STK Push Successful", {
        checkoutID: stkResponse.CheckoutRequestID,
      });
    } catch (error) {
      logger.error("STK Push Failed", { error: error.message });
      await whatsappService.sendMessage(
        debtor.phone,
        "We couldn't trigger the M-Pesa prompt. Please pay manually via Paybill 522533."
      );
    }
  }
}

module.exports = new AIWebhookController();
