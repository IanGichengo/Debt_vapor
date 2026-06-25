const prisma = require("../../config/database");
const geminiAgentService = require("./geminiAgentService");
const reminderService = require("./reminderService");
const reminderScheduler = require("./reminderScheduler");
const mpesaService = require("../mpesa/mpesa.service");
const phoneHelper = require("../utils/phoneHelper");
const whatsappService = require("../whatsapp/whatsappService");
const geminiConfig = require("../../config/gemini");
const logger = geminiConfig.getLogger();

class AIController {
  /**
   * Test Gemini API connection
   */
  async testConnection(req, res) {
    try {
      const isValid = await geminiConfig.validateConnection();
      if (isValid) {
        return res.status(200).json({
          success: true,
          message: "Gemini AI connection is working",
          config: { model: geminiConfig.config.model },
        });
      }
      return res.status(503).json({ success: false, message: "Gemini AI connection failed" });
    } catch (error) {
      logger.error("testConnection failed", { error: error.message });
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Post-migration Conversational Analysis
   */
  async analyzeMessage(req, res) {
    try {
      const { debtorId, message } = req.body;
      const userId = req.user.id;

      const debtor = await prisma.debtor.findFirst({
        where: { id: debtorId, userId },
        include: { debts: { where: { status: { in: ["pending", "active"] } }, orderBy: { dueDate: "asc" } } }
      });

      if (!debtor || !debtor.debts.length) {
        return res.status(404).json({ success: false, message: "Debtor or debt not found" });
      }

      const analysis = await geminiAgentService.analyzeDebtorMessage(message, debtor, debtor.debts[0]);
      return res.status(200).json({ success: true, data: analysis });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Generate Payment Plan and persist to Chat History
   */
  async generatePaymentPlan(req, res) {
    try {
      const { debtorId, debtId, analysis, triggerSTK } = req.body;
      const userId = req.user.id;

      const debtor = await prisma.debtor.findFirst({ where: { id: debtorId, userId } });
      const debt = await prisma.debt.findFirst({ where: { id: debtId, debtorId, userId } });

      if (!debtor || !debt) return res.status(404).json({ success: false, message: "Records not found" });

      const plan = await geminiAgentService.generatePaymentPlan(analysis || {}, debtor, debt);

      const createdPlan = await prisma.paymentPlan.create({
        data: {
          debtorId: debtor.id,
          createdById: userId,
          totalAmount: plan.totalAmount,
          installmentAmount: plan.installmentAmount,
          frequency: plan.frequency,
          nextDueDate: new Date(plan.firstPaymentDate),
          status: "ACTIVE",
        },
      });

      await whatsappService.sendMessage(debtor.phone, plan.message);

      // Save to History (direction: OUT)
      await prisma.reminder.create({
        data: {
          debtorId, userId,
          message: plan.message,
          channel: "WHATSAPP",
          status: "SENT",
          direction: "OUT",
          sentAt: new Date(),
        }
      });

      return res.status(201).json({ success: true, data: { paymentPlan: createdPlan } });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * ⭐ THE MISSING METHOD: scheduleReminders
   */
  async scheduleReminders(req, res) {
    try {
      const { paymentPlanId } = req.body;
      const userId = req.user.id;

      const paymentPlan = await prisma.paymentPlan.findFirst({
        where: { id: paymentPlanId, createdById: userId }
      });

      if (!paymentPlan) return res.status(404).json({ success: false, message: "Payment plan not found" });

      const reminders = await reminderService.scheduleRemindersForPaymentPlan(paymentPlanId);

      return res.status(201).json({
        success: true,
        message: `${reminders.length} reminders scheduled`,
        data: reminders
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Manual send for a specific reminder
   */
  async sendReminder(req, res) {
    try {
      const { reminderId } = req.body;
      const updatedReminder = await reminderService.sendReminder(reminderId);
      return res.status(200).json({ success: true, data: updatedReminder });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Get all pending reminders
   */
  async getPendingReminders(req, res) {
    try {
      const reminders = await prisma.reminder.findMany({
        where: { userId: req.user.id, status: "PENDING" },
        include: { debtor: true },
        orderBy: { scheduledFor: "asc" }
      });
      return res.status(200).json({ success: true, data: reminders });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Admin: Trigger Scheduler Manually
   */
  async triggerScheduler(req, res) {
    try {
      if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Admin only" });
      reminderScheduler.triggerNow();
      return res.status(200).json({ success: true, message: "Scheduler triggered" });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Admin: Get Scheduler Status
   */
  async getSchedulerStatus(req, res) {
    try {
      if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Admin only" });
      const status = reminderScheduler.getStatus();
      return res.status(200).json({ success: true, data: status });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AIController();
