const walletService = require("./walletService");

// ============================================
// GET WALLET BALANCE
// ============================================

/**
 * Lightweight endpoint used by the sidebar balance widget.
 * Returns only the balance figure, not the full transaction history.
 */
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = await walletService.getOrCreateWallet(userId);

    return res.json({
      success: true,
      balance: wallet.balance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// GET FULL WALLET (My Account page)
// ============================================

/**
 * Returns the wallet object with its full transaction history.
 * Uses getWallet which internally calls getOrCreateWallet,
 * so this never returns null for a fresh account.
 */
const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const wallet = await walletService.getWallet(userId);

    return res.json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// GET TRANSACTIONS (paginated)
// ============================================

/**
 * Paginated transaction history for the My Account page.
 * Query params: ?page=1&limit=10
 */
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const result = await walletService.getTransactions({ userId, page, limit });

    return res.json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getWalletBalance,
  getWallet,
  getTransactions,
};
