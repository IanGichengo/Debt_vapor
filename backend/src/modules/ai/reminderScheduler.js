const cron = require("node-cron");
const reminderService = require("./reminderService");
const logger = require("../../config/gemini").getLogger();

/**
 * Reminder Scheduler
 * Automated cron job for processing and sending pending reminders
 */
class ReminderScheduler {
  constructor() {
    this.job = null;
    this.isRunning = false;

    // Configuration
    this.config = {
      // Run every hour at minute 0 (e.g., 10:00, 11:00, 12:00)
      schedule: process.env.REMINDER_CRON_SCHEDULE || "0 * * * *",
      timezone: process.env.REMINDER_TIMEZONE || "Africa/Nairobi",
      batchSize: parseInt(process.env.REMINDER_BATCH_SIZE || "20"),
      delayBetweenReminders: parseInt(process.env.REMINDER_DELAY_MS || "3000"), // 3 seconds
    };

    logger.info("Reminder scheduler initialized", this.config);
  }

  /**
   * Start the cron job
   */
  start() {
    if (this.job) {
      logger.warn("Reminder scheduler already running");
      return;
    }

    logger.info("Starting reminder scheduler", {
      schedule: this.config.schedule,
      timezone: this.config.timezone,
    });

    this.job = cron.schedule(
      this.config.schedule,
      async () => {
        await this.processReminders();
      },
      {
        scheduled: true,
        timezone: this.config.timezone,
      },
    );

    logger.info("Reminder scheduler started successfully");
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.job = null;
      logger.info("Reminder scheduler stopped");
    }
  }

  /**
   * Process pending reminders
   * @private
   */
  async processReminders() {
    if (this.isRunning) {
      logger.warn("Reminder processing already in progress, skipping...");
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info("Starting reminder processing cycle");

      // Get pending reminders
      const pendingReminders = await reminderService.getPendingReminders();

      if (pendingReminders.length === 0) {
        logger.info("No pending reminders to process");
        return;
      }

      logger.info(`Processing ${pendingReminders.length} pending reminders`);

      const results = {
        total: pendingReminders.length,
        sent: 0,
        failed: 0,
        errors: [],
      };

      // Process reminders in batches
      for (let i = 0; i < pendingReminders.length; i += this.config.batchSize) {
        const batch = pendingReminders.slice(i, i + this.config.batchSize);

        logger.info(
          `Processing batch ${Math.floor(i / this.config.batchSize) + 1}`,
          {
            batchSize: batch.length,
          },
        );

        for (const reminder of batch) {
          try {
            await reminderService.sendReminder(reminder.id);
            results.sent++;

            logger.debug("Reminder sent successfully", {
              reminderId: reminder.id,
              debtorPhone: reminder.debtor.phone,
            });

            // Add delay between reminders to avoid rate limiting
            if (i + batch.indexOf(reminder) < pendingReminders.length - 1) {
              await new Promise((resolve) =>
                setTimeout(resolve, this.config.delayBetweenReminders),
              );
            }
          } catch (error) {
            results.failed++;
            results.errors.push({
              reminderId: reminder.id,
              error: error.message,
            });

            logger.error("Failed to send reminder", {
              reminderId: reminder.id,
              error: error.message,
            });
          }
        }

        // Pause between batches
        if (i + this.config.batchSize < pendingReminders.length) {
          logger.debug("Pausing between batches...");
          await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second pause
        }
      }

      // Process failed reminders (retry logic)
      logger.info("Processing previously failed reminders...");
      const retryResults = await reminderService.processFailedReminders();

      const duration = Date.now() - startTime;

      logger.info("Reminder processing cycle completed", {
        duration: `${(duration / 1000).toFixed(2)}s`,
        totalProcessed: results.total,
        sent: results.sent,
        failed: results.failed,
        retried: retryResults.processed,
        retriedSucceeded: retryResults.succeeded,
      });

      // Log summary if there were errors
      if (results.errors.length > 0) {
        logger.warn("Reminder processing had errors", {
          errorCount: results.errors.length,
          errors: results.errors.slice(0, 10), // Log first 10 errors
        });
      }

      // Process overdue debt reminders
      logger.info("Starting overdue debt reminders processing...");
      try {
        const overdueResults =
          await reminderService.processOverdueDebtReminders();
        logger.info("Overdue debt reminders processed", {
          created: overdueResults.remindersCreated,
          updated: overdueResults.remindersUpdated,
          debtorsWithOverdue: overdueResults.debtorsWithOverdueDebts,
        });
      } catch (overdueError) {
        logger.error("Failed to process overdue debt reminders", {
          error: overdueError.message,
        });
      }
    } catch (error) {
      logger.error("Reminder processing cycle failed", {
        error: error.message,
        stack: error.stack,
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manually trigger reminder processing (for testing)
   */
  async triggerNow() {
    logger.info("Manual reminder processing triggered");
    await this.processReminders();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isScheduled: this.job !== null,
      isRunning: this.isRunning,
      schedule: this.config.schedule,
      timezone: this.config.timezone,
      nextRun: this.job ? "Scheduled" : "Not scheduled",
    };
  }
}

// Export singleton instance
const schedulerInstance = new ReminderScheduler();

// Auto-start if REMINDER_AUTO_START is true
if (process.env.REMINDER_AUTO_START !== "false") {
  // Delay start by 5 seconds to ensure database is connected
  setTimeout(() => {
    schedulerInstance.start();
    logger.info("Reminder scheduler auto-started");
  }, 5000);
}

module.exports = schedulerInstance;
