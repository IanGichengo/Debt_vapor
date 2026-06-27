require("dotenv").config();

const app = require("./api/index");

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
      `Environment: ${process.env.NODE_ENV || "development"}`
    );

    if (process.env.NODE_ENV !== "production") {
      const reminderScheduler = require("./src/modules/ai/reminderScheduler");

      setTimeout(() => {
        reminderScheduler.start();
        console.log("✓ AI Reminder Scheduler initialized");
      }, 5000);
    }
  });
}
