const service = require("./withdrawalService");

// ============================================
// REQUEST WITHDRAWAL
// ============================================

const requestWithdrawal = async (req, res) => {
  try {
    const data = await service.requestWithdrawal({
      userId: req.user.id,
      amount: req.body.amount,
      phone: req.body.phone,
      reason: req.body.reason,
    });

    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ============================================
// GET MY WITHDRAWALS
// ============================================

const getMyWithdrawals = async (req, res) => {
  try {
    const data = await service.getUserWithdrawals(req.user.id);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================
// APPROVE WITHDRAWAL (admin only)
// ============================================

const approveWithdrawal = async (req, res) => {
  try {
    const data = await service.approveWithdrawal({
      withdrawalId: req.params.id,
      adminId: req.user.id,
    });

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// ============================================
// REJECT WITHDRAWAL (admin only)
// ============================================

const rejectWithdrawal = async (req, res) => {
  try {
    const data = await service.rejectWithdrawal({
      withdrawalId: req.params.id,
      adminId: req.user.id,
    });

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  requestWithdrawal,
  getMyWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
};
