const prisma = require("../../config/database");

class DebtService {
  /**
   * Create a new debt
   */
  async createDebt(data, userId) {
    // NEW: Extracted creditorName and creditorType
    const { 
      debtorId, 
      amount, 
      dueDate, 
      debtType, 
      amountPaid, 
      status, 
      creditorName, 
      creditorType 
    } = data;

    // Verify debtor exists and belongs to the user
    const debtor = await prisma.debtor.findFirst({
      where: {
        id: debtorId,
        userId: userId,
      },
    });

    if (!debtor) {
      const error = new Error("Debtor not found or unauthorized");
      error.status = 404;
      throw error;
    }

    // Create the debt
    const debt = await prisma.debt.create({
      data: {
        debtorId,
        userId,
        amount,
        amountPaid: amountPaid || 0,
        dueDate: new Date(dueDate),
        debtType: debtType || "ONE_TIME",
        status: status || "pending",
        creditorName, // NEW
        creditorType: creditorType || "COMPANY", // NEW (fallback to COMPANY if not provided)
      },
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return debt;
  }

  /**
   * Get all debts with pagination, search, and filtering
   */
  async getAllDebts(userId, queryParams) {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      debtType,
      debtorId,
    } = queryParams;

    // Build where clause
    const where = {
      userId: userId,
    };

    // Filter by debtor name (search)
    if (search) {
      where.debtor = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by debt type
    if (debtType) {
      where.debtType = debtType;
    }

    // Filter by specific debtor
    if (debtorId) {
      where.debtorId = debtorId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.debt.count({ where });

    // Fetch debts
    const debts = await prisma.debt.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add computed field for outstanding amount
    const debtsWithOutstanding = debts.map((debt) => ({
      ...debt,
      outstandingAmount: debt.amount - debt.amountPaid,
    }));

    return {
      debts: debtsWithOutstanding,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all debts for a user (no pagination - for dashboard)
   * NEW METHOD
   */
  async getAllDebtsForDashboard(userId) {
    const debts = await prisma.debt.findMany({
      where: { userId },
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add computed field for outstanding amount
    const debtsWithOutstanding = debts.map((debt) => ({
      ...debt,
      outstandingAmount: debt.amount - debt.amountPaid,
    }));

    return debtsWithOutstanding;
  }

  /**
   * Get debts summary for multiple debtors (bulk query)
   * NEW METHOD
   */
  async getBulkDebtsSummary(userId, debtorIds) {
    const debts = await prisma.debt.findMany({
      where: {
        userId,
        debtorId: {
          in: debtorIds
        }
      },
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group debts by debtorId
    const debtsByDebtor = {};
    debts.forEach(debt => {
      if (!debtsByDebtor[debt.debtorId]) {
        debtsByDebtor[debt.debtorId] = [];
      }
      debtsByDebtor[debt.debtorId].push(debt);
    });

    return debtsByDebtor;
  }

  /**
   * Get a single debt by ID
   */
  async getDebtById(debtId, userId) {
    const debt = await prisma.debt.findFirst({
      where: {
        id: debtId,
        userId: userId,
      },
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            nationalId: true,
          },
        },
      },
    });

    if (!debt) {
      const error = new Error("Debt not found or unauthorized");
      error.status = 404;
      throw error;
    }

    // Add computed field for outstanding amount
    return {
      ...debt,
      outstandingAmount: debt.amount - debt.amountPaid,
    };
  }

  /**
   * Update a debt
   */
  async updateDebt(debtId, data, userId) {
    // Check if debt exists and belongs to user
    const existingDebt = await prisma.debt.findFirst({
      where: {
        id: debtId,
        userId: userId,
      },
    });

    if (!existingDebt) {
      const error = new Error("Debt not found or unauthorized");
      error.status = 404;
      throw error;
    }

    // If debtorId is being updated, verify the new debtor exists and belongs to user
    if (data.debtorId && data.debtorId !== existingDebt.debtorId) {
      const debtor = await prisma.debtor.findFirst({
        where: {
          id: data.debtorId,
          userId: userId,
        },
      });

      if (!debtor) {
        const error = new Error("Debtor not found or unauthorized");
        error.status = 404;
        throw error;
      }
    }

    // Prepare update data
    const updateData = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.amountPaid !== undefined) updateData.amountPaid = data.amountPaid;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.debtType !== undefined) updateData.debtType = data.debtType;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.debtorId !== undefined) updateData.debtorId = data.debtorId;
    
    // NEW: Allow updating creditor details
    if (data.creditorName !== undefined) updateData.creditorName = data.creditorName;
    if (data.creditorType !== undefined) updateData.creditorType = data.creditorType;

    // Update the debt
    const updatedDebt = await prisma.debt.update({
      where: { id: debtId },
      data: updateData,
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return {
      ...updatedDebt,
      outstandingAmount: updatedDebt.amount - updatedDebt.amountPaid,
    };
  }

  /**
   * Delete a debt (soft delete by updating status)
   */
  async deleteDebt(debtId, userId) {
    // Check if debt exists and belongs to user
    const existingDebt = await prisma.debt.findFirst({
      where: {
        id: debtId,
        userId: userId,
      },
    });

    if (!existingDebt) {
      const error = new Error("Debt not found or unauthorized");
      error.status = 404;
      throw error;
    }

    // Soft delete by updating status
    const deletedDebt = await prisma.debt.update({
      where: { id: debtId },
      data: { status: "cancelled" },
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return deletedDebt;
  }

  /**
   * Record a payment for a debt
   */
  async recordPayment(debtId, paymentAmount, userId) {
    // Check if debt exists and belongs to user
    const existingDebt = await prisma.debt.findFirst({
      where: {
        id: debtId,
        userId: userId,
      },
    });

    if (!existingDebt) {
      const error = new Error("Debt not found or unauthorized");
      error.status = 404;
      throw error;
    }

    // Calculate new amountPaid
    const newAmountPaid = existingDebt.amountPaid + paymentAmount;

    // Check if payment exceeds debt amount
    if (newAmountPaid > existingDebt.amount) {
      const error = new Error(
        `Payment amount exceeds outstanding debt. Outstanding: ${
          existingDebt.amount - existingDebt.amountPaid
        }`
      );
      error.status = 400;
      throw error;
    }

    // Prepare update data
    const updateData = {
      amountPaid: newAmountPaid,
    };

    // Auto-update status to completed if fully paid
    if (newAmountPaid >= existingDebt.amount) {
      updateData.status = "completed";
    } else if (existingDebt.status === "pending") {
      // Update to active if first payment made
      updateData.status = "active";
    }

    // Update the debt
    const updatedDebt = await prisma.debt.update({
      where: { id: debtId },
      data: updateData,
      include: {
        debtor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return {
      ...updatedDebt,
      outstandingAmount: updatedDebt.amount - updatedDebt.amountPaid,
    };
  }

  /**
   * Get debt statistics for a user
   */
  async getDebtStats(userId) {
    const debts = await prisma.debt.findMany({
      where: { userId },
      select: {
        amount: true,
        amountPaid: true,
        status: true,
        dueDate: true,
      },
    });

    const stats = {
      totalDebts: debts.length,
      totalAmount: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      activeDebts: 0,
      completedDebts: 0,
      overdueDebts: 0,
    };

    const now = new Date();

    debts.forEach((debt) => {
      stats.totalAmount += debt.amount;
      stats.totalPaid += debt.amountPaid;
      stats.totalOutstanding += debt.amount - debt.amountPaid;

      if (debt.status === "completed") {
        stats.completedDebts++;
      } else if (debt.status === "active" || debt.status === "pending") {
        stats.activeDebts++;

        // Check if overdue
        if (new Date(debt.dueDate) < now && debt.amountPaid < debt.amount) {
          stats.overdueDebts++;
        }
      }
    });

    return stats;
  }

  /**
   * Get comprehensive dashboard statistics
   * NEW METHOD
   */
  async getDashboardStats(userId) {
    const debts = await this.getAllDebtsForDashboard(userId);
    const debtors = await prisma.debtor.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Calculate statistics
    let totalDebtors = debtors.length;
    let totalDebts = debts.length;
    let totalOutstanding = 0;
    let totalPaid = 0;
    let totalAmount = 0;
    
    let activeDebts = 0;
    let overdueDebts = 0;
    let upcomingDebts = 0;
    let paidDebts = 0;

    // Group debts by debtor for top debtors
    const debtsByDebtor = {};
    
    debts.forEach(debt => {
      // Calculate totals
      totalAmount += debt.amount;
      totalPaid += debt.amountPaid;
      
      const balance = debt.amount - debt.amountPaid;
      totalOutstanding += balance;
      
      // Group by debtor
      if (!debtsByDebtor[debt.debtorId]) {
        debtsByDebtor[debt.debtorId] = {
          totalDebt: 0,
          totalPaid: 0,
          balance: 0,
          debts: []
        };
      }
      debtsByDebtor[debt.debtorId].totalDebt += debt.amount;
      debtsByDebtor[debt.debtorId].totalPaid += debt.amountPaid;
      debtsByDebtor[debt.debtorId].balance += balance;
      debtsByDebtor[debt.debtorId].debts.push(debt);

      // Categorize debts
      const dueDate = new Date(debt.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));
      
      if (debt.amountPaid >= debt.amount) {
        paidDebts++;
      } else if (dueDate < now) {
        overdueDebts++;
        activeDebts++;
      } else if (daysUntilDue <= 7 && daysUntilDue >= 0) {
        upcomingDebts++;
        activeDebts++;
      } else if (debt.amountPaid < debt.amount) {
        activeDebts++;
      }
    });

    // Calculate top debtors
    const topDebtors = Object.keys(debtsByDebtor)
      .map(debtorId => {
        const debtor = debtors.find(d => d.id === debtorId);
        if (!debtor) return null;
        
        return {
          id: debtorId,
          name: debtor.name,
          phone: debtor.phone,
          totalBalance: debtsByDebtor[debtorId].balance,
          debtCount: debtsByDebtor[debtorId].debts.length,
          isOverdue: debtsByDebtor[debtorId].debts.some(d => {
            const dueDate = new Date(d.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < now && d.amountPaid < d.amount;
          })
        };
      })
      .filter(debtor => debtor && debtor.totalBalance > 0)
      .sort((a, b) => b.totalBalance - a.totalBalance)
      .slice(0, 5);

    // Calculate recent payments (last 7 days)
    const recentPayments = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayDebts = debts.filter(debt => {
        const updated = new Date(debt.updatedAt || debt.createdAt);
        return updated.toISOString().split('T')[0] === dateString && debt.amountPaid > 0;
      });
      
      recentPayments.push({
        date: dateString,
        amount: dayDebts.reduce((sum, debt) => sum + debt.amountPaid, 0),
        count: dayDebts.length
      });
    }

    // Calculate recovery rate
    const recoveryRate = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
    
    // Calculate average debt amount
    const averageDebtAmount = totalDebts > 0 ? Math.round(totalAmount / totalDebts) : 0;

    return {
      totalDebtors,
      totalDebts,
      totalOutstanding,
      totalPaid,
      activeDebts,
      overdueDebts,
      upcomingDebts,
      paidDebts,
      averageDebtAmount,
      recoveryRate,
      recentPayments,
      topDebtors,
      debtStatusDistribution: [
        { status: 'Paid', count: paidDebts, color: 'bg-green-500' },
        { status: 'Overdue', count: overdueDebts, color: 'bg-red-500' },
        { status: 'Upcoming', count: upcomingDebts, color: 'bg-yellow-500' },
        { status: 'Active', count: activeDebts - overdueDebts - upcomingDebts, color: 'bg-blue-500' }
      ].filter(item => item.count > 0)
    };
  }
}

module.exports = new DebtService();
