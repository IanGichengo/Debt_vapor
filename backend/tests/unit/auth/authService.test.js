jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../src/config/database", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const authService = require("../../../src/modules/auth/authService");
const prisma = require("../../../src/config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Successful registration
describe("register()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    // No existing user
    prisma.user.findUnique.mockResolvedValue(null);

    // Password hashing
    bcrypt.hash.mockResolvedValue("hashedPassword");

    // User creation
    prisma.user.create.mockResolvedValue({
      id: 1,
      name: "John Doe",
      email: "john@test.com",
      role: "COLLECTOR",
      createdAt: new Date(),
    });

    // Fake tokens
    jwt.sign.mockReturnValue("fakeToken");

    const result = await authService.register({
      name: "John Doe",
      email: "john@test.com",
      password: "Password123",
    });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john@test.com" },
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 12);

    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  it("should throw error if user already exists", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });

    await expect(
      authService.register({
        name: "John",
        email: "john@test.com",
        password: "Password123",
      })
    ).rejects.toThrow("User with this email already exists");
  });
});

// Successfull Login
describe("login()", () => {
  it("should login user with valid credentials", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: "John",
      email: "john@test.com",
      password: "hashedPassword",
      role: "COLLECTOR",
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fakeToken");

    const result = await authService.login({
      email: "john@test.com",
      password: "Password123",
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "Password123",
      "hashedPassword"
    );

    expect(result.user.email).toBe("john@test.com");
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(result.user.password).toBeUndefined();
  });

  it("should throw error if user does not exist", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login({
        email: "missing@test.com",
        password: "Password123",
      })
    ).rejects.toThrow("Invalid email or password");
  });

  it("should throw error if password is incorrect", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: "john@test.com",
      password: "hashedPassword",
    });

    bcrypt.compare.mockResolvedValue(false);

    await expect(
      authService.login({
        email: "john@test.com",
        password: "WrongPassword",
      })
    ).rejects.toThrow("Invalid email or password");
  });
});

// REFRESH TOKEN
describe("refreshToken()", () => {
  it("should refresh tokens for valid refresh token", async () => {
    jwt.verify.mockReturnValue({ userId: 1 });

    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: "John",
      email: "john@test.com",
      role: "COLLECTOR",
    });

    jwt.sign.mockReturnValue("newToken");

    const result = await authService.refreshToken("validRefreshToken");

    expect(jwt.verify).toHaveBeenCalled();
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  it("should throw error if user not found", async () => {
    jwt.verify.mockReturnValue({ userId: 99 });
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.refreshToken("validRefreshToken")).rejects.toThrow(
      "User not found"
    );
  });

  it("should throw error for invalid or expired refresh token", async () => {
    jwt.verify.mockImplementation(() => {
      const err = new Error("Invalid token");
      err.name = "JsonWebTokenError";
      throw err;
    });

    await expect(authService.refreshToken("invalidToken")).rejects.toThrow(
      "Invalid or expired refresh token"
    );
  });
});

// GET PROFILE
describe("getProfile()", () => {
  it("should return user profile", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: "John",
      email: "john@test.com",
      role: "COLLECTOR",
    });

    const result = await authService.getProfile(1);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    expect(result.email).toBe("john@test.com");
  });

  it("should throw error if user not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(authService.getProfile(1)).rejects.toThrow("User not found");
  });
});
