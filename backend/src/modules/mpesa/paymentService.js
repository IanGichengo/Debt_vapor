const prisma = require("../../config/database");

/**
 * Get all payments for a debtor
 */
const getPaymentsByDebtor = async (debtorId, userId) => {
  const payments = await prisma.payment.findMany({
    where: {
      debtorId,
      userId, // Ensure user owns this debtor
    },
    include: {
      debt: {
        select: {
          id: true,
          amount: true,
          dueDate: true,
          status: true,
        },
      },
    },
    orderBy: {
      paymentDate: "desc",
    },
  });

  return payments;
};

/**
 * Get all payments for a specific debt
 */
const getPaymentsByDebt = async (debtId, userId) => {
  const payments = await prisma.payment.findMany({
    where: {
      debtId,
      userId,
    },
    include: {
      debtor: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
    orderBy: {
      paymentDate: "desc",
    },
  });

  return payments;
};

/**
 * Create a manual payment record (for cash, bank transfer, etc.)
 */
const createManualPayment = async (paymentData, userId) => {
  const { debtorId, debtId, amount, method, receiptNumber, paymentDate } =
    paymentData;

  // Verify the debt exists and user owns it
  const debt = await prisma.debt.findFirst({
    where: {
      id: debtId,
      userId,
      debtor: {
        id: debtorId,
      },
    },
  });

  if (!debt) {
    throw new Error("Debt not found or you don't have permission");
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      debtorId,
      debtId,
      userId,
      amount: parseFloat(amount),
      method: method || "CASH",
      receiptNumber,
      status: "COMPLETED",
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    },
  });

  // Update debt's amountPaid
  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: {
      amountPaid: {
        increment: parseFloat(amount),
      },
      status:
        debt.amountPaid + parseFloat(amount) >= debt.amount
          ? "paid"
          : "pending",
    },
  });

  // Log the action
  await prisma.log.create({
    data: {
      userId,
      debtorId,
      action: `Manual Payment Recorded (${method})`,
      details: {
        paymentId: payment.id,
        amount: parseFloat(amount),
        method,
        receiptNumber,
        remainingBalance: updatedDebt.amount - updatedDebt.amountPaid,
      },
    },
  });

  return payment;
};

/**
 * Get payment statistics for a debtor
 */
const getPaymentStats = async (debtorId, userId) => {
  const payments = await prisma.payment.findMany({
    where: {
      debtorId,
      userId,
      status: "COMPLETED",
    },
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const paymentCount = payments.length;
  const lastPaymentDate =
    payments.length > 0 ? payments[0].paymentDate : null;

  // Get payment methods breakdown
  const methodBreakdown = payments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + p.amount;
    return acc;
  }, {});

  return {
    totalPaid,
    paymentCount,
    lastPaymentDate,
    methodBreakdown,
  };
};

module.exports = {
  getPaymentsByDebtor,
  getPaymentsByDebt,
  createManualPayment,
  getPaymentStats,
};
