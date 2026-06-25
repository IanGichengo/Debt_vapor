const prisma = require("../../config/database");

// ============================================
// GET OR CREATE WALLET
// ============================================

/**
 * Returns the wallet for a user, creating one if it doesn't exist yet.
 * Use this everywhere instead of a raw findUnique to avoid null issues
 * on fresh accounts that haven't received a payment yet.
 */
async function getOrCreateWallet(userId) {
  return prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId, balance: 0 },
  });
}

// ============================================
// CREDIT WALLET (M-Pesa payments)
// ============================================

/**
 * Credits the user's wallet for a confirmed M-Pesa payment.
 * Idempotent — passing the same M-Pesa receipt reference twice
 * is a no-op, preventing double-crediting on callback retries.
 */
async function creditWallet({ userId, amount, reference }) {
  if (!reference) {
    throw new Error("Transaction reference is required");
  }

  // Idempotency guard
  const existing = await prisma.walletTransaction.findFirst({
    where: { reference },
  });
  if (existing) {
    console.log(`[wallet] Duplicate transaction ignored: ${reference}`);
    return prisma.wallet.findUnique({ where: { userId } });
  }

  const wallet = await getOrCreateWallet(userId);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: Number(amount) } },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: "CREDIT",
        amount: Number(amount),
        status: "COMPLETED",
        reference,
      },
    });

    return updated;
  });
}

// ============================================
// DEBIT WALLET (manual withdrawals)
// ============================================

/**
 * Debits the user's wallet.
 * Called by the withdrawal approval flow — not directly by the user.
 */
async function debitWallet({ userId, amount, reference }) {
  if (!reference) {
    throw new Error("Withdrawal reference is required");
  }

  const wallet = await getOrCreateWallet(userId);

  if (wallet.balance < Number(amount)) {
    throw new Error("Insufficient wallet balance");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: Number(amount) } },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: "DEBIT",
        amount: Number(amount),
        status: "COMPLETED",
        reference,
      },
    });

    return updated;
  });
}

// ============================================
// GET WALLET (My Account summary)
// ============================================

/**
 * Returns the wallet and its full transaction history.
 * Creates the wallet if it doesn't exist so the My Account
 * page never receives a null response.
 */
async function getWallet(userId) {
  const wallet = await getOrCreateWallet(userId);

  return prisma.wallet.findUnique({
    where: { id: wallet.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// ============================================
// GET TRANSACTIONS (paginated)
// ============================================

/**
 * Returns a paginated slice of the user's ledger entries,
 * plus a total count for building pagination controls on the
 * My Account page.
 */
async function getTransactions({ userId, page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  const [transactions, total] = await prisma.$transaction([
    prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.walletTransaction.count({ where: { userId } }),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

module.exports = {
  getOrCreateWallet,
  creditWallet,
  debitWallet,
  getWallet,
  getTransactions,
};
