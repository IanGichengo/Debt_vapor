require("dotenv").config();

const app = require("./api");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

  require("./src/modules/ai/reminderScheduler");
  console.log("✓ AI Reminder Scheduler initialized");
});
