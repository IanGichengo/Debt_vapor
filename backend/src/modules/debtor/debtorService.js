// src/modules/debtor/debtorService.js
const prisma = require("../../config/database");

/**
 * Service for debtor-related operations
 */
class DebtorService {
  /**
   * Create a new debtor linked to a specific user
   */
  async createDebtor(debtorData, userId) {
    const { name, phone, email, nationalId, status } = debtorData;

    // Check if national ID already exists FOR THIS USER
    if (nationalId) {
      const existingNationalId = await prisma.debtor.findFirst({
        where: { nationalId, userId },
      });

      if (existingNationalId) {
        const error = new Error(
          "A debtor with this national ID already exists in your records",
        );
        error.status = 409;
        throw error;
      }
    }

    // Check if email already exists FOR THIS USER
    if (email) {
      const existingEmail = await prisma.debtor.findFirst({
        where: { email, userId },
      });

      if (existingEmail) {
        const error = new Error(
          "A debtor with this email already exists in your records",
        );
        error.status = 409;
        throw error;
      }
    }

    // Create the debtor
    const debtor = await prisma.debtor.create({
      data: {
        name,
        phone,
        email: email || null,
        nationalId: nationalId || null,
        status: status || "active",
        userId: userId, // Link to the creator
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        nationalId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return debtor;
  }

  /**
   * Get all debtors belonging to the user with filters and pagination
   */
  async getAllDebtors(options = {}) {
    const {
      userId, // Required
      page = 1,
      limit = 10,
      search = "",
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause - Start with userId to enforce isolation
    const where = { userId };

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
        { nationalId: { contains: search } },
      ];
    }

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Get total count (filtered by user)
    const total = await prisma.debtor.count({ where });

    // Get debtors
    const debtors = await prisma.debtor.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        nationalId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            debts: true,
            reminders: true,
            paymentPlans: true,
          },
        },
      },
    });

    return {
      debtors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single debtor by ID (Checking ownership)
   */
  async getDebtorById(id, userId, include) {
    const includeOptions = {};

    if (include === "all") {
      includeOptions.debts = {
        include: {
          payments: true, // Include payments for each debt
        },
      };
      includeOptions.reminders = true;
      includeOptions.paymentPlans = {
        include: {
          payments: true, // Include payments for each payment plan
        },
      };
      includeOptions.logs = true;
    } else if (include) {
      // Handle individual includes
      if (include === "debts") {
        includeOptions.debts = {
          include: {
            payments: true,
          },
        };
      } else if (include === "paymentPlans") {
        includeOptions.paymentPlans = {
          include: {
            payments: true,
          },
        };
      } else if (include === "payments") {
        // Include payments directly if requested
        includeOptions.payments = true;
      } else {
        includeOptions[include] = true;
      }
    }

    // Use findFirst instead of findUnique to include the userId in the filter
    const debtor = await prisma.debtor.findFirst({
      where: {
        id,
        userId, // Only find if it belongs to this user
      },
      include:
        Object.keys(includeOptions).length > 0 ? includeOptions : undefined,
    });

    if (!debtor) {
      const error = new Error("Debtor not found or you do not have permission");
      error.status = 404;
      throw error;
    }

    return debtor;
  }

  /**
   * Get all payments for a specific debtor
   */
  async getDebtorPayments(debtorId, userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      status,
      sortBy = "paymentDate",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    // First verify debtor exists and belongs to user
    const debtor = await prisma.debtor.findFirst({
      where: {
        id: debtorId,
        userId,
      },
    });

    if (!debtor) {
      const error = new Error("Debtor not found or you do not have permission");
      error.status = 404;
      throw error;
    }

    // Build where clause for payments
    const where = {
      OR: [
        { debt: { debtorId, userId } },
        { paymentPlan: { debtorId, userId } },
      ],
    };

    // Add date filters
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) {
        where.paymentDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.paymentDate.lte = new Date(endDate);
      }
    }

    // Add status filter
    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.payment.count({ where });

    // Get payments
    const payments = await prisma.payment.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        debt: {
          select: {
            id: true,
            title: true,
            amount: true,
          },
        },
        paymentPlan: {
          select: {
            id: true,
            title: true,
            totalAmount: true,
          },
        },
      },
    });

    return {
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a debtor (Checking ownership)
   */
  async updateDebtor(id, userId, updateData) {
    const { name, phone, email, nationalId, status } = updateData;

    // Check if debtor exists and belongs to user
    const existingDebtor = await this.getDebtorById(id, userId);

    // Check if national ID is being updated and already exists for THIS user
    if (nationalId && nationalId !== existingDebtor.nationalId) {
      const existingNationalId = await prisma.debtor.findFirst({
        where: { nationalId, userId },
      });

      if (existingNationalId) {
        const error = new Error(
          "A debtor with this national ID already exists in your records",
        );
        error.status = 409;
        throw error;
      }
    }

    // Check if email is being updated and already exists for THIS user
    if (email && email !== existingDebtor.email) {
      const existingEmail = await prisma.debtor.findFirst({
        where: { email, userId },
      });

      if (existingEmail) {
        const error = new Error(
          "A debtor with this email already exists in your records",
        );
        error.status = 409;
        throw error;
      }
    }

    // Update the debtor
    const updatedDebtor = await prisma.debtor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email !== undefined && { email: email || null }),
        ...(nationalId !== undefined && { nationalId: nationalId || null }),
        ...(status && { status }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        nationalId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedDebtor;
  }

  /**
   * Delete a debtor (Checking ownership)
   */
  async deleteDebtor(id, userId) {
    // Check if debtor exists and belongs to user
    await this.getDebtorById(id, userId);

    // Soft delete: update status to inactive
    const deletedDebtor = await prisma.debtor.update({
      where: { id },
      data: {
        status: "inactive",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        nationalId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return deletedDebtor;
  }
}

module.exports = new DebtorService();
