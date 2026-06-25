const prisma = require("../../config/database");
const geminiAgentService = require("./geminiAgentService");
const whatsappService = require("../whatsapp/whatsappService");
const logger = require("../../config/gemini").getLogger();

class ReminderService {
  /**
   * Get reminder settings for a debtor
   */
  async getReminderSettings(debtorId, userId) {
    try {
      let settings = await prisma.reminderSettings.findFirst({
        where: { debtorId, userId },
      });

      if (!settings) {
        settings = await prisma.userDefaultReminderSettings.findUnique({
          where: { userId },
        });
      }

      if (!settings) {
        return { enabled: false, interval: 7, maxReminders: 3 };
      }
      return settings;
    } catch (error) {
      logger.error("Failed to get reminder settings", { error: error.message });
      return { enabled: false, interval: 7, maxReminders: 3 };
    }
  }

  /**
   * Schedule automated reminders for a payment plan
   */
  async scheduleRemindersForPaymentPlan(paymentPlanId) {
    try {
      const paymentPlan = await prisma.paymentPlan.findUnique({
        where: { id: paymentPlanId },
        include: { debtor: true, createdBy: true },
      });

      if (!paymentPlan) throw new Error(`Payment plan ${paymentPlanId} not found`);

      const settings = await this.getReminderSettings(paymentPlan.debtorId, paymentPlan.createdById);

      if (!settings.enabled) return [];

      const reminders = await this.generateReminders(paymentPlan, settings);
      return reminders;
    } catch (error) {
      logger.error("Failed to schedule reminders", { error: error.message });
      throw error;
    }
  }

  /**
   * Generate reminder schedule (DB Persistence)
   * FIXED: Added direction: "OUT"
   */
  async generateReminders(paymentPlan, settings) {
    const reminders = [];
    const dueDate = new Date(paymentPlan.nextDueDate);
    const now = new Date();
    const interval = settings.interval || 7;
    const maxReminders = settings.maxReminders || 3;

    const reminderSchedule = [];
    for (let i = 0; i < maxReminders; i++) {
      const daysOffset = -(interval * (i + 1));
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() + daysOffset);

      if (reminderDate > now) {
        reminderSchedule.push({
          daysOffset,
          type: i === 0 ? "first_reminder" : i === maxReminders - 1 ? "final_reminder" : `reminder_${i + 1}`,
        });
      }
    }

    if (dueDate > now) reminderSchedule.push({ daysOffset: 0, type: "due_today" });

    for (const schedule of reminderSchedule) {
      const scheduledDate = new Date(dueDate);
      scheduledDate.setDate(scheduledDate.getDate() + schedule.daysOffset);

      try {
        const reminder = await prisma.reminder.create({
          data: {
            debtorId: paymentPlan.debtorId,
            userId: paymentPlan.createdById,
            message: `Placeholder - AI will generate this (${schedule.type})`,
            channel: "WHATSAPP",
            status: "PENDING",
            direction: "OUT", // Standardized for chat history
            scheduledFor: scheduledDate,
            attempts: 0,
            metadata: { type: schedule.type, daysBeforeDue: Math.abs(schedule.daysOffset) },
          },
        });
        reminders.push(reminder);
      } catch (error) {
        logger.error("Failed to create reminder record", { error: error.message });
      }
    }
    return reminders;
  }

  /**
   * Send a specific reminder via WhatsApp
   * FIXED: Updates direction and stores AI generated message
   */
  async sendReminder(reminderId) {
    try {
      const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId },
        include: {
          debtor: {
            include: {
              debts: { where: { status: { in: ["pending", "active"] } }, orderBy: { dueDate: "asc" } },
              paymentPlans: { where: { status: "ACTIVE" }, orderBy: { nextDueDate: "asc" } },
            },
          },
          user: true,
        },
      });

      if (!reminder) throw new Error(`Reminder ${reminderId} not found`);
      if (reminder.status === "SENT") return reminder;

      const paymentPlan = reminder.debtor.paymentPlans[0] || null;
      const debt = reminder.debtor.debts[0];

      if (!debt) {
        await prisma.reminder.update({ where: { id: reminderId }, data: { status: "FAILED" } });
        return reminder;
      }

      const dueDate = paymentPlan ? new Date(paymentPlan.nextDueDate) : new Date(debt.dueDate);
      const daysUntilDue = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));

      let message;
      try {
        message = await geminiAgentService.generateReminderMessage(reminder, reminder.debtor, paymentPlan, daysUntilDue);
      } catch (aiError) {
        message = `Dear ${reminder.debtor.name}, your payment is due soon. Pay via M-Pesa Paybill 522533, Acc: ${reminder.debtor.id}. Thank you.`;
      }

      try {
        await whatsappService.sendMessage(reminder.debtor.phone, message);

        const updatedReminder = await prisma.reminder.update({
          where: { id: reminderId },
          data: {
            status: "SENT",
            direction: "OUT", // Ensures visibility on right side
            sentAt: new Date(),
            message: message, 
            attempts: reminder.attempts + 1,
          },
        });

        await prisma.log.create({
          data: {
            userId: reminder.userId,
            debtorId: reminder.debtorId,
            action: "Reminder Sent",
            details: { reminderId, automated: true },
          },
        });

        return updatedReminder;
      } catch (whatsappError) {
        return await prisma.reminder.update({
          where: { id: reminderId },
          data: { status: "FAILED", attempts: reminder.attempts + 1 },
        });
      }
    } catch (error) {
      logger.error("sendReminder process failed", { error: error.message });
      throw error;
    }
  }

  async processFailedReminders(maxAttempts = 3) {
    const failedReminders = await prisma.reminder.findMany({
      where: { status: "FAILED", attempts: { lt: maxAttempts }, scheduledFor: { lte: new Date() } },
      take: 10,
    });

    for (const reminder of failedReminders) {
      await prisma.reminder.update({ where: { id: reminder.id }, data: { status: "PENDING" } });
      await this.sendReminder(reminder.id).catch(() => {});
    }
  }

  async getPendingReminders() {
    return await prisma.reminder.findMany({
      where: { status: "PENDING", scheduledFor: { lte: new Date() } },
      include: { debtor: true, user: true },
      orderBy: { scheduledFor: "asc" },
      take: 50,
    });
  }
}

module.exports = new ReminderService();
