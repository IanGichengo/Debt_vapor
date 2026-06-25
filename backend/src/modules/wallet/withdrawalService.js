const prisma = require("../../config/database");
const walletService = require("../wallet/walletService");

// ============================================
// REQUEST WITHDRAWAL (creditor-initiated)
// ============================================

/**
 * Creates a PENDING withdrawal record.
 * Does NOT touch the wallet balance yet — that only happens
 * when an admin approves the request, preventing premature debits.
 */
const requestWithdrawal = async ({ userId, amount, phone, reason }) => {
  if (!amount || Number(amount) <= 0) {
    throw new Error("Invalid withdrawal amount");
  }
  if (!phone) {
    throw new Error("M-Pesa phone number is required");
  }

  const wallet = await walletService.getOrCreateWallet(userId);

  if (wallet.balance < Number(amount)) {
    throw new Error("Insufficient wallet balance");
  }

  return prisma.withdrawal.create({
    data: {
      userId,
      walletId: wallet.id,
      amount: Number(amount),
      phone,
      reason: reason || null,
      status: "PENDING",
    },
  });
};

// ============================================
// APPROVE WITHDRAWAL (admin-only)
// ============================================

/**
 * Approves a pending withdrawal:
 * 1. Debits the wallet atomically via walletService (creates ledger entry)
 * 2. Marks the withdrawal record as APPROVED
 *
 * Uses walletService.debitWallet to keep all balance mutations
 * in one place and avoid duplicating the $transaction logic.
 */
const approveWithdrawal = async ({ withdrawalId, adminId }) => {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal not found");
  }
  if (withdrawal.status !== "PENDING") {
    throw new Error(`Cannot approve a withdrawal with status: ${withdrawal.status}`);
  }

  // Debit wallet + create ledger entry (atomic inside walletService)
  await walletService.debitWallet({
    userId: withdrawal.userId,
    amount: withdrawal.amount,
    reference: `WITHDRAWAL-${withdrawal.id}`,
  });

  // Mark as approved
  return prisma.withdrawal.update({
    where: { id: withdrawal.id },
    data: {
      status: "APPROVED",
      processedBy: adminId,
    },
  });
};

// ============================================
// REJECT WITHDRAWAL (admin-only)
// ============================================

/**
 * Rejects a pending withdrawal without touching the wallet balance.
 */
const rejectWithdrawal = async ({ withdrawalId, adminId }) => {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal not found");
  }
  if (withdrawal.status !== "PENDING") {
    throw new Error(`Cannot reject a withdrawal with status: ${withdrawal.status}`);
  }

  return prisma.withdrawal.update({
    where: { id: withdrawal.id },
    data: {
      status: "REJECTED",
      processedBy: adminId,
    },
  });
};

// ============================================
// GET USER'S OWN WITHDRAWALS
// ============================================

const getUserWithdrawals = async (userId) => {
  return prisma.withdrawal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

module.exports = {
  requestWithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
  getUserWithdrawals,
};
