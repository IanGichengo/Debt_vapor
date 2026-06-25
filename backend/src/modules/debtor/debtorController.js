const debtorService = require("./debtorService");
const prisma = require("../../config/database");

/**
 * Create a new debtor
 */
exports.create = async (req, res, next) => {
  try {
    const debtor = await debtorService.createDebtor(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: { debtor },
    });
  } catch (error) {
    console.error("CREATE DEBTOR ERROR:", error);
    next(error);
  }
};

/**
 * Get all debtors for the authenticated user (with pagination & search)
 */
exports.getAllDebtors = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 50);

    const result = await debtorService.getAllDebtors({
      page,
      limit,
      search: req.query.search || "",
      status: req.query.status,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      data: {
        debtors: result.debtors || [],
        pagination: result.pagination || {
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        },
      },
    });
  } catch (error) {
    console.error("GET DEBTORS ERROR:", error);
    next(error);
  }
};

/**
 * Get single debtor by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const debtor = await debtorService.getDebtorById(
      req.params.id,
      req.user.id,
      req.query.include
    );
    res.status(200).json({
      success: true,
      data: { debtor },
    });
  } catch (error) {
    console.error("GET DEBTOR BY ID ERROR:", error);
    next(error);
  }
};

/**
 * Update debtor details
 */
exports.update = async (req, res, next) => {
  try {
    const debtor = await debtorService.updateDebtor(
      req.params.id,
      req.user.id,
      req.body
    );
    res.status(200).json({
      success: true,
      data: { debtor },
    });
  } catch (error) {
    console.error("UPDATE DEBTOR ERROR:", error);
    next(error);
  }
};

/**
 * Delete a debtor
 */
exports.delete = async (req, res, next) => {
  try {
    const debtor = await debtorService.deleteDebtor(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: "Debtor deleted successfully",
      data: { debtor },
    });
  } catch (error) {
    console.error("DELETE DEBTOR ERROR:", error);
    next(error);
  }
};

/**
 * Get chat history for a specific debtor
 * Merges Message table (live conversation) + Reminder table (scheduled reminders)
 * Both normalized into the unified shape ChatBubble expects
 */
exports.getChatHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Verify debtor belongs to this user
    const debtor = await prisma.debtor.findFirst({
      where: { id, userId },
    });
    if (!debtor) {
      return res
        .status(404)
        .json({ success: false, message: "Debtor not found" });
    }

    // 2. Fetch live conversation messages (inbound debtor replies + outbound AI responses)
    const messages = await prisma.message.findMany({
      where: { debtorId: id },
      orderBy: { timestamp: "asc" },
    });

    // 3. Fetch sent scheduled reminders
    const reminders = await prisma.reminder.findMany({
      where: {
        debtorId: id,
        status: "SENT",
      },
      orderBy: { sentAt: "asc" },
    });

    // 4. Normalize both into the unified shape ChatBubble expects
    const normalizedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      direction: msg.direction,    // "IN" = left/white | "OUT" = right/blue — never overwrite
      channel: msg.channel,
      status: msg.status,
      timestamp: msg.timestamp,
      source: "message",
    }));

    const normalizedReminders = reminders.map((reminder) => ({
      id: reminder.id,
      content: reminder.message,
      direction: reminder.direction, // "OUT" from reminderService — never overwrite
      channel: reminder.channel,
      status: reminder.status,
      timestamp: reminder.sentAt,
      source: "reminder",
    }));

    // 5. Merge and sort the full history chronologically
    const history = [...normalizedMessages, ...normalizedReminders].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("GET CHAT HISTORY ERROR:", error);
    next(error);
  }
};
