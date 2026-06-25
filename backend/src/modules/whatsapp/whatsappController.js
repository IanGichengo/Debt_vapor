const whatsappService = require("./whatsappService");
const prisma = require("../../config/database");
const logger = require("../../config/gemini").getLogger();

class WhatsAppController {
  /**
   * Send WhatsApp reminder to a debtor
   * Includes 60s debounce and Database Persistence for Chat History
   */
  async sendToDebtor(req, res, next) {
    try {
      const { debtorId } = req.params;
      const userId = req.user.id;

      // 1. IDEMPOTENCY CHECK (Prevents spamming the debtor)
      const recentLog = await prisma.log.findFirst({
        where: {
          debtorId: debtorId,
          action: "WhatsApp Reminder Sent",
          createdAt: { gte: new Date(Date.now() - 60000) } // 1 minute window
        }
      });

      if (recentLog) {
        logger?.warn(`Blocked duplicate reminder for debtor: ${debtorId}`);
        return res.status(200).json({ 
          success: false, 
          message: "A reminder was sent very recently. Please wait a minute." 
        });
      }

      // 2. FETCH DEBTOR & DEBTS
      const debtor = await prisma.debtor.findFirst({
        where: { id: debtorId, userId: userId },
      });

      if (!debtor) return res.status(404).json({ success: false, message: "Debtor not found" });

      const debts = await prisma.debt.findMany({
        where: { debtorId: debtor.id, userId, status: { in: ["pending", "active"] } }
      });

      if (debts.length === 0) {
        return res.status(400).json({ success: false, message: "No active debts found for this debtor." });
      }

      // 3. CALCULATE FINANCIALS
      const totalBalance = debts.reduce((sum, d) => sum + (d.amount - (d.amountPaid || 0)), 0);
      const creditorName = debts[0].creditorName || "DCS Admin";
      const finalAmountString = Math.round(totalBalance).toLocaleString();

      // 4. PREPARE META TEMPLATE (Matches your account_balance_service template)
      const components = [{
        type: "body",
        parameters: [
          { type: "text", text: debtor.name },           // {{1}}
          { type: "text", text: creditorName },         // {{2}}
          { type: "text", text: finalAmountString }      // {{3}}
        ]
      }];

      // 5. EXECUTE WHATSAPP SEND
      const formattedPhone = debtor.phone.replace(/\D/g, '');
      const result = await whatsappService.sendTemplate(
        formattedPhone, 
        "account_balance_service", 
        "en", 
        components
      );

      // 6. RECONSTRUCT PLAIN TEXT FOR HISTORY
      const messageText = `Hello ${debtor.name}, this is an automated reminder from ${creditorName}. Your current outstanding balance is KES ${finalAmountString}. Please settle this to keep your account in good standing.`;

      // 7. ATOMIC PERSISTENCE (Transaction)
      // We save to Log (for security/debounce) and Reminder (for Chat UI)
      await prisma.$transaction([
        prisma.log.create({
          data: {
            userId,
            debtorId,
            action: "WhatsApp Reminder Sent",
            details: { 
              amount: finalAmountString, 
              recipient: debtor.name,
              provider_msg_id: result.messages?.[0]?.id 
            }
          }
        }),
        prisma.reminder.create({
          data: {
            userId,
            debtorId,
            message: messageText,
            channel: "WHATSAPP",
            status: "SENT",
            sentAt: new Date(),
            metadata: { provider_id: result.messages?.[0]?.id }
          }
        })
      ]);

      logger?.info(`Reminder sent and logged for: ${debtor.name}`);

      return res.status(200).json({ 
        success: true, 
        message: `Reminder successfully sent to ${debtor.name}`,
        data: result 
      });

    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      logger?.error("SendToDebtor Controller Error:", { error: errorMsg });
      return res.status(500).json({ success: false, error: "System failed to process reminder" });
    }
  }
}

module.exports = new WhatsAppController();
