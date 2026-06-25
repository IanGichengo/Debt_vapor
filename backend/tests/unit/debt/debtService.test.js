const prisma = require("../../../src/config/database");
const debtService = require("../../../src/modules/debt/debtService");

// Mock Prisma client
jest.mock("../../../src/config/database", () => ({
  debt: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
  debtor: {
    findFirst: jest.fn(),
  },
}));

describe("DebtService", () => {
  const mockUserId = "user-123";
  const mockDebtorId = "debtor-456";
  const mockDebtId = "debt-789";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createDebt", () => {
    const mockDebtData = {
      debtorId: mockDebtorId,
      amount: 1000,
      dueDate: "2026-02-01",
      debtType: "ONE_TIME",
    };

    const mockDebtor = {
      id: mockDebtorId,
      name: "John Doe",
      userId: mockUserId,
    };

    const mockCreatedDebt = {
      id: mockDebtId,
      debtorId: mockDebtorId,
      userId: mockUserId,
      amount: 1000,
      amountPaid: 0,
      dueDate: new Date("2026-02-01"),
      debtType: "ONE_TIME",
      status: "pending",
      debtor: {
        id: mockDebtorId,
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
      },
    };

    it("should create a debt successfully", async () => {
      prisma.debtor.findFirst.mockResolvedValue(mockDebtor);
      prisma.debt.create.mockResolvedValue(mockCreatedDebt);

      const result = await debtService.createDebt(mockDebtData, mockUserId);

      expect(prisma.debtor.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockDebtorId,
          userId: mockUserId,
        },
      });

      expect(prisma.debt.create).toHaveBeenCalledWith({
        data: {
          debtorId: mockDebtorId,
          userId: mockUserId,
          amount: 1000,
          amountPaid: 0,
          dueDate: new Date("2026-02-01"),
          debtType: "ONE_TIME",
          status: "pending",
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

      expect(result).toHaveProperty("id");
      expect(result.amount).toBe(1000);
      expect(result.debtorId).toBe(mockDebtorId);
    });

    it("should throw error if debtor not found", async () => {
      prisma.debtor.findFirst.mockResolvedValue(null);

      await expect(
        debtService.createDebt(mockDebtData, mockUserId)
      ).rejects.toThrow("Debtor not found or unauthorized");
    });

    it("should throw error with status 404 for unauthorized debtor", async () => {
      prisma.debtor.findFirst.mockResolvedValue(null);

      try {
        await debtService.createDebt(mockDebtData, mockUserId);
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe("Debtor not found or unauthorized");
      }
    });
  });

  describe("getAllDebts", () => {
    const mockDebts = [
      {
        id: "debt-1",
        amount: 1000,
        amountPaid: 300,
        status: "active",
        debtType: "ONE_TIME",
        debtor: { id: mockDebtorId, name: "John Doe" },
      },
      {
        id: "debt-2",
        amount: 2000,
        amountPaid: 0,
        status: "pending",
        debtType: "INSTALLMENT",
        debtor: { id: "debtor-2", name: "Jane Smith" },
      },
    ];

    it("should get all debts with pagination", async () => {
      prisma.debt.count.mockResolvedValue(2);
      prisma.debt.findMany.mockResolvedValue(mockDebts);

      const result = await debtService.getAllDebts(mockUserId, {
        page: 1,
        limit: 10,
      });

      expect(prisma.debt.count).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });

      expect(prisma.debt.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        skip: 0,
        take: 10,
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

      expect(result.debts).toHaveLength(2);
      expect(result.debts[0]).toHaveProperty("outstandingAmount");
      expect(result.debts[0].outstandingAmount).toBe(700);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it("should filter debts by status", async () => {
      prisma.debt.count.mockResolvedValue(1);
      prisma.debt.findMany.mockResolvedValue([mockDebts[0]]);

      await debtService.getAllDebts(mockUserId, {
        status: "active",
        page: 1,
        limit: 10,
      });

      expect(prisma.debt.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: "active",
        },
      });
    });

    it("should search debts by debtor name", async () => {
      prisma.debt.count.mockResolvedValue(1);
      prisma.debt.findMany.mockResolvedValue([mockDebts[0]]);

      await debtService.getAllDebts(mockUserId, {
        search: "John",
        page: 1,
        limit: 10,
      });

      expect(prisma.debt.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          debtor: {
            name: {
              contains: "John",
              mode: "insensitive",
            },
          },
        },
      });
    });
  });

  describe("getDebtById", () => {
    const mockDebt = {
      id: mockDebtId,
      amount: 1000,
      amountPaid: 300,
      status: "active",
      debtor: {
        id: mockDebtorId,
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
      },
    };

    it("should get debt by ID successfully", async () => {
      prisma.debt.findFirst.mockResolvedValue(mockDebt);

      const result = await debtService.getDebtById(mockDebtId, mockUserId);

      expect(prisma.debt.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockDebtId,
          userId: mockUserId,
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

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("outstandingAmount");
      expect(result.outstandingAmount).toBe(700);
    });

    it("should throw error if debt not found", async () => {
      prisma.debt.findFirst.mockResolvedValue(null);

      await expect(
        debtService.getDebtById(mockDebtId, mockUserId)
      ).rejects.toThrow("Debt not found or unauthorized");
    });
  });

  describe("updateDebt", () => {
    const mockExistingDebt = {
      id: mockDebtId,
      debtorId: mockDebtorId,
      userId: mockUserId,
      amount: 1000,
      amountPaid: 0,
    };

    const mockUpdatedDebt = {
      ...mockExistingDebt,
      amount: 1500,
      debtor: {
        id: mockDebtorId,
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
      },
    };

    it("should update debt successfully", async () => {
      prisma.debt.findFirst.mockResolvedValue(mockExistingDebt);
      prisma.debt.update.mockResolvedValue(mockUpdatedDebt);

      const updateData = { amount: 1500 };
      const result = await debtService.updateDebt(
        mockDebtId,
        updateData,
        mockUserId
      );

      expect(prisma.debt.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockDebtId,
          userId: mockUserId,
        },
      });

      expect(prisma.debt.update).toHaveBeenCalledWith({
        where: { id: mockDebtId },
        data: { amount: 1500 },
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

      expect(result.amount).toBe(1500);
      expect(result).toHaveProperty("outstandingAmount");
    });

    it("should throw error if debt not found", async () => {
      prisma.debt.findFirst.mockResolvedValue(null);

      await expect(
        debtService.updateDebt(mockDebtId, { amount: 1500 }, mockUserId)
      ).rejects.toThrow("Debt not found or unauthorized");
    });

    it("should validate new debtor if debtorId is updated", async () => {
      const newDebtorId = "debtor-999";
      const mockDebtor = { id: newDebtorId, userId: mockUserId };

      prisma.debt.findFirst.mockResolvedValue(mockExistingDebt);
      prisma.debtor.findFirst.mockResolvedValue(mockDebtor);
      prisma.debt.update.mockResolvedValue({
        ...mockUpdatedDebt,
        debtorId: newDebtorId,
      });

      await debtService.updateDebt(
        mockDebtId,
        { debtorId: newDebtorId },
        mockUserId
      );

      expect(prisma.debtor.findFirst).toHaveBeenCalledWith({
        where: {
          id: newDebtorId,
          userId: mockUserId,
        },
      });
    });
  });

  describe("deleteDebt", () => {
    const mockExistingDebt = {
      id: mockDebtId,
      userId: mockUserId,
      status: "active",
    };

    const mockDeletedDebt = {
      ...mockExistingDebt,
      status: "cancelled",
      debtor: {
        id: mockDebtorId,
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
      },
    };

    it("should soft delete debt successfully", async () => {
      prisma.debt.findFirst.mockResolvedValue(mockExistingDebt);
      prisma.debt.update.mockResolvedValue(mockDeletedDebt);

      const result = await debtService.deleteDebt(mockDebtId, mockUserId);

      expect(prisma.debt.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockDebtId,
          userId: mockUserId,
        },
      });

      expect(prisma.debt.update).toHaveBeenCalledWith({
        where: { id: mockDebtId },
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

      expect(result.status).toBe("cancelled");
    });

    it("should throw error if debt not found", async () => {
      prisma.debt.findFirst.mockResolvedValue(null);

      await expect(
        debtService.deleteDebt(mockDebtId, mockUserId)
      ).rejects.toThrow("Debt not found or unauthorized");
    });
  });

  describe("recordPayment", () => {
    const mockExistingDebt = {
      id: mockDebtId,
      userId: mockUserId,
      amount: 1000,
      amountPaid: 300,
      status: "active",
    };

    const mockUpdatedDebt = {
      ...mockExistingDebt,
      amountPaid: 600,
      debtor: {
        id: mockDebtorId,
        name: "John Doe",
        phone: "1234567890",
        email: "john@example.com",
      },
    };

    it("should record payment successfully", async () => {
      prisma.debt.findFirst.mockResolvedValue(mockExistingDebt);
      prisma.debt.update.mockResolvedValue(mockUpdatedDebt);

      const result = await debtService.recordPayment(
        mockDebtId,
        300,
        mockUserId
      );

      expect(prisma.debt.update).toHaveBeenCalledWith({
        where: { id: mockDebtId },
        data: {
          amountPaid: 600,
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

      expect(result.amountPaid).toBe(600);
      expect(result).toHaveProperty("outstandingAmount");
    });

    it("should mark debt as completed when fully paid", async () => {
      prisma.debt.findFirst.mockResolvedValue(mockExistingDebt);
      prisma.debt.update.mockResolvedValue({
        ...mockUpdatedDebt,
        amountPaid: 1000,
        status: "completed",
      });

      await debtService.recordPayment(mockDebtId, 700, mockUserId);

      expect(prisma.debt.update).toHaveBeenCalledWith({
        where: { id: mockDebtId },
        data: {
          amountPaid: 1000,
          status: "completed",
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
    });

    it("should throw error if payment exceeds outstanding debt", async () => {
      prisma.debt.findFirst.mockResolvedValue(mockExistingDebt);

      await expect(
        debtService.recordPayment(mockDebtId, 800, mockUserId)
      ).rejects.toThrow("Payment amount exceeds outstanding debt");
    });

    it("should throw error if debt not found", async () => {
      prisma.debt.findFirst.mockResolvedValue(null);

      await expect(
        debtService.recordPayment(mockDebtId, 300, mockUserId)
      ).rejects.toThrow("Debt not found or unauthorized");
    });
  });

  describe("getDebtStats", () => {
    const mockDebts = [
      {
        amount: 1000,
        amountPaid: 300,
        status: "active",
        dueDate: new Date("2026-03-01"),
      },
      {
        amount: 2000,
        amountPaid: 2000,
        status: "completed",
        dueDate: new Date("2026-02-01"),
      },
      {
        amount: 1500,
        amountPaid: 500,
        status: "active",
        dueDate: new Date("2026-01-01"), // Overdue
      },
    ];

    it("should calculate debt statistics correctly", async () => {
      prisma.debt.findMany.mockResolvedValue(mockDebts);

      const result = await debtService.getDebtStats(mockUserId);

      expect(prisma.debt.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        select: {
          amount: true,
          amountPaid: true,
          status: true,
          dueDate: true,
        },
      });

      expect(result.totalDebts).toBe(3);
      expect(result.totalAmount).toBe(4500);
      expect(result.totalPaid).toBe(2800);
      expect(result.totalOutstanding).toBe(1700);
      expect(result.activeDebts).toBe(2);
      expect(result.completedDebts).toBe(1);
      expect(result.overdueDebts).toBe(1);
    });
  });
});
