const debtService = require("./debtService");

/**
 * Create a new debt
 */
exports.createDebt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const debt = await debtService.createDebt(req.body, userId);

    res.status(201).json({
      success: true,
      message: "Debt created successfully",
      data: debt,
    });
  } catch (error) {
    console.error("CREATE DEBT ERROR:", error);
    next(error);
  }
};

/**
 * Get all debts with pagination and filtering
 */
exports.getAllDebts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await debtService.getAllDebts(userId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET ALL DEBTS ERROR:", error);
    next(error);
  }
};

/**
 * Get all debts for dashboard (no pagination)
 */
exports.getAllDebtsForDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const debts = await debtService.getAllDebtsForDashboard(userId);

    res.status(200).json({
      success: true,
      data: debts,
    });
  } catch (error) {
    console.error("GET ALL DEBTS FOR DASHBOARD ERROR:", error);
    next(error);
  }
};

/**
 * Get bulk debts summary for multiple debtors
 */
exports.getBulkDebtsSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { debtorIds } = req.query;

    if (!debtorIds) {
      return res.status(400).json({
        success: false,
        message: "Debtor IDs are required",
      });
    }

    const ids = debtorIds.split(",");
    const summary = await debtService.getBulkDebtsSummary(userId, ids);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("GET BULK DEBTS SUMMARY ERROR:", error);
    next(error);
  }
};

/**
 * Get comprehensive dashboard statistics
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await debtService.getDashboardStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("GET DASHBOARD STATS ERROR:", error);
    next(error);
  }
};

/**
 * Get a single debt by ID
 */
exports.getDebtById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const debt = await debtService.getDebtById(id, userId);

    res.status(200).json({
      success: true,
      data: debt,
    });
  } catch (error) {
    console.error("GET DEBT BY ID ERROR:", error);
    next(error);
  }
};

/**
 * Update a debt
 */
exports.updateDebt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const debt = await debtService.updateDebt(id, req.body, userId);

    res.status(200).json({
      success: true,
      message: "Debt updated successfully",
      data: debt,
    });
  } catch (error) {
    console.error("UPDATE DEBT ERROR:", error);
    next(error);
  }
};

/**
 * Delete a debt (soft delete)
 */
exports.deleteDebt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const debt = await debtService.deleteDebt(id, userId);

    res.status(200).json({
      success: true,
      message: "Debt deleted successfully",
      data: debt,
    });
  } catch (error) {
    console.error("DELETE DEBT ERROR:", error);
    next(error);
  }
};

/**
 * Record a payment for a debt
 */
exports.recordPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount } = req.body;

    const debt = await debtService.recordPayment(id, amount, userId);

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: debt,
    });
  } catch (error) {
    console.error("RECORD PAYMENT ERROR:", error);
    next(error);
  }
};

/**
 * Get debt statistics
 */
exports.getDebtStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await debtService.getDebtStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("GET DEBT STATS ERROR:", error);
    next(error);
  }
};
