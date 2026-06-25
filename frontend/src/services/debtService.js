import api from "./api";

// ======================
// CREATE DEBT
// ======================
export const createDebt = async (debtData) => {
  const res = await api.post("/debts", debtData);
  return res.data?.data || res.data;
};

// ======================
// GET DEBTS BY DEBTOR (via query param)
// ======================
export const getDebtsByDebtor = async (debtorId) => {
  if (!debtorId) return [];

  const res = await api.get("/debts", {
    params: { debtorId },
  });

  return res.data?.data?.debts || [];
};

// ======================
// GET ALL DEBTS (for dashboard) - NEW
// ======================
export const getAllDebts = async () => {
  try {
    const res = await api.get("/debts/all");
    return res.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch all debts:", error);
    return [];
  }
};

// ======================
// GET DEBTS SUMMARY FOR ALL DEBTORS (optimized for table) - NEW
// ======================
export const getDebtsSummaryForAllDebtors = async (debtorIds) => {
  if (!debtorIds || debtorIds.length === 0) return {};

  try {
    const res = await api.get("/debts/bulk-summary", {
      params: { debtorIds: debtorIds.join(',') },
    });
    return res.data?.data || {};
  } catch (error) {
    console.warn("Bulk summary endpoint not available, fetching individually:", error);
    
    // Fallback to individual requests
    const promises = debtorIds.map(async (debtorId) => {
      try {
        const res = await api.get("/debts", {
          params: { debtorId },
        });
        const debts = res.data?.data?.debts || [];
        return { debtorId, debts };
      } catch (err) {
        console.error(`Failed to fetch debts for debtor ${debtorId}:`, err);
        return { debtorId, debts: [] };
      }
    });
    
    const results = await Promise.all(promises);
    
    // Transform to object for easy lookup
    const summary = {};
    results.forEach(result => {
      summary[result.debtorId] = result.debts;
    });
    
    return summary;
  }
};

// ======================
// GET DASHBOARD STATISTICS - NEW
// ======================
export const getDashboardStats = async () => {
  try {
    const res = await api.get("/debts/dashboard-stats");
    return res.data?.data || {
      totalDebtors: 0,
      totalDebts: 0,
      totalOutstanding: 0,
      totalPaid: 0,
      activeDebts: 0,
      overdueDebts: 0,
      upcomingDebts: 0,
      paidDebts: 0,
      averageDebtAmount: 0,
      recoveryRate: 0,
      recentPayments: [],
      topDebtors: [],
      debtStatusDistribution: []
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      totalDebtors: 0,
      totalDebts: 0,
      totalOutstanding: 0,
      totalPaid: 0,
      activeDebts: 0,
      overdueDebts: 0,
      upcomingDebts: 0,
      paidDebts: 0,
      averageDebtAmount: 0,
      recoveryRate: 0,
      recentPayments: [],
      topDebtors: [],
      debtStatusDistribution: []
    };
  }
};

// ======================
// COMPUTE DEBT SUMMARY (client-side)
// ======================
export const getDebtSummary = async (debtorId) => {
  if (!debtorId) {
    return { totalDebt: 0, totalPaid: 0, balance: 0, debtCount: 0 };
  }

  const res = await api.get("/debts", {
    params: { debtorId },
  });

  const debts = res.data?.data?.debts || [];

  let totalDebt = 0;
  let totalPaid = 0;

  debts.forEach((d) => {
    totalDebt += d.amount;
    totalPaid += d.amountPaid;
  });

  return {
    totalDebt,
    totalPaid,
    balance: totalDebt - totalPaid,
    debtCount: debts.length,
  };
};

// ======================
// CALCULATE DEBTOR STATUS (utility function)
// ======================
export const calculateDebtorStatus = (debts) => {
  if (!debts || debts.length === 0) {
    return {
      status: "No Debts",
      color: "bg-gray-100 text-gray-700",
      dotColor: "bg-gray-500",
      description: "No active debts",
      balance: 0
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let hasOverdue = false;
  let hasUpcoming = false;
  let allPaid = true;
  let anyPending = false;
  let totalBalance = 0;

  debts.forEach(debt => {
    const dueDate = new Date(debt.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    // Calculate balance
    const balance = debt.amount - debt.amountPaid;
    totalBalance += balance;

    // Check if debt is paid
    if (debt.status !== "paid" && debt.amountPaid < debt.amount) {
      allPaid = false;
    }

    // Check if debt is pending
    if (debt.status === "pending" || (debt.amountPaid < debt.amount && debt.amountPaid > 0)) {
      anyPending = true;
    }

    // Check if debt is overdue (due date in past and not fully paid)
    if (dueDate < today && debt.amountPaid < debt.amount) {
      hasOverdue = true;
    }

    // Check if debt is upcoming (due within next 7 days)
    const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
    if (daysUntilDue >= 0 && daysUntilDue <= 7 && debt.amountPaid < debt.amount) {
      hasUpcoming = true;
    }
  });

  // Determine status based on conditions
  if (allPaid) {
    return {
      status: "Fully Paid",
      color: "bg-green-100 text-green-700",
      dotColor: "bg-green-500",
      description: "All debts are paid",
      balance: totalBalance
    };
  } else if (hasOverdue) {
    return {
      status: "Overdue",
      color: "bg-red-100 text-red-700",
      dotColor: "bg-red-500 animate-pulse",
      description: "Has overdue debts",
      balance: totalBalance
    };
  } else if (hasUpcoming) {
    return {
      status: "Upcoming",
      color: "bg-yellow-100 text-yellow-700",
      dotColor: "bg-yellow-500",
      description: "Payment due within 7 days",
      balance: totalBalance
    };
  } else if (anyPending) {
    return {
      status: "Active",
      color: "bg-blue-100 text-blue-700",
      dotColor: "bg-blue-500",
      description: "Active debts in progress",
      balance: totalBalance
    };
  } else {
    return {
      status: "Active",
      color: "bg-blue-100 text-blue-700",
      dotColor: "bg-blue-500",
      description: "Has active debts",
      balance: totalBalance
    };
  }
};

// ======================
// CALCULATE DEBT STATS (utility function)
// ======================
export const calculateDebtStats = (debts) => {
  if (!debts || debts.length === 0) {
    return {
      totalDebt: 0,
      totalPaid: 0,
      balance: 0,
      debtCount: 0,
      paidCount: 0,
      pendingCount: 0,
      overdueCount: 0,
      upcomingCount: 0
    };
  }

  let totalDebt = 0;
  let totalPaid = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;
  let upcomingCount = 0;

  debts.forEach((d) => {
    totalDebt += d.amount;
    totalPaid += d.amountPaid;
    
    const dueDate = new Date(d.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (d.amountPaid >= d.amount) {
      paidCount++;
    } else if (dueDate < today) {
      overdueCount++;
    } else if (daysUntilDue <= 7 && daysUntilDue >= 0) {
      upcomingCount++;
    } else {
      pendingCount++;
    }
  });

  return {
    totalDebt,
    totalPaid,
    balance: totalDebt - totalPaid,
    debtCount: debts.length,
    paidCount,
    pendingCount,
    overdueCount,
    upcomingCount
  };
};

// ======================
// RECORD PAYMENT
// ======================
export const recordPayment = async (debtId, amount) => {
  const res = await api.post(`/debts/${debtId}/payment`, { amount });
  return res.data?.data || res.data;
};

// ======================
// UPDATE DEBT
// ======================
export const updateDebt = async (debtId, updateData) => {
  const res = await api.put(`/debts/${debtId}`, updateData);
  return res.data?.data || res.data;
};

// ======================
// DELETE DEBT
// ======================
export const deleteDebt = async (debtId) => {
  const res = await api.delete(`/debts/${debtId}`);
  return res.data;
};
