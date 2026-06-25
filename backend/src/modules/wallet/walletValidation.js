// ============================================
// WALLET VALIDATION MIDDLEWARE
// ============================================

/**
 * Validates the body for a withdrawal request.
 * Called before the controller so the service never
 * receives invalid input.
 */
function validateWithdrawal(req, res, next) {
  const { amount, phone } = req.body;

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: "amount must be a positive number",
    });
  }

  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "phone is required (M-Pesa number to send funds to)",
    });
  }

  next();
}

module.exports = { validateWithdrawal };
