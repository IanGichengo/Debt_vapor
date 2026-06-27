require("dotenv").config();

const app = require("./api");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Environment: ${process.env.NODE_ENV || "development"}`
  );

  // Never start cron jobs on Vercel
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.VERCEL !== "1"
  ) {
    const reminderScheduler = require("./src/modules/ai/reminderScheduler");

    setTimeout(() => {
      reminderScheduler.start();
      console.log("✓ AI Reminder Scheduler initialized");
    }, 5000);
  }
});
