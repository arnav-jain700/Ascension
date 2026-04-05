import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";

const router = express.Router();

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// Register new user
router.post("/register", asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    dateOfBirth,
    gender,
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "First name, last name, email, and password are required",
    });
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "User with this email already exists",
    });
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken(user.id);

  // Create session
  await prisma.userSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip,
    },
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user,
      token,
    },
  });
}));

// Login user
router.post("/login", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Email and password are required",
    });
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      isActive: true,
      password: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Authentication Error",
      message: "Invalid email or password",
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      error: "Authentication Error",
      message: "Account is inactive",
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: "Authentication Error",
      message: "Invalid email or password",
    });
  }

  // Generate token
  const token = generateToken(user.id);

  // Create session
  await prisma.userSession.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip,
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: userWithoutPassword,
      token,
    },
  });
}));

// Logout user
router.post("/logout", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.substring(7);

  if (token) {
    // Delete session
    await prisma.userSession.deleteMany({
      where: { token },
    });
  }

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}));

// Get current user profile
router.get("/profile", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
}));

// Update user profile
router.put("/profile", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
  } = req.body;

  const updateData: any = {};

  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  if (gender) updateData.gender = gender;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
}));

// Change password
router.put("/change-password", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Current password and new password are required",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "New password must be at least 8 characters long",
    });
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, password: true },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "User not found",
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Current password is incorrect",
    });
  }

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "12");
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedNewPassword },
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
}));

// Get user sessions
router.get("/sessions", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const sessions = await prisma.userSession.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      isActive: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  res.status(200).json({
    success: true,
    data: sessions,
  });
}));

// Revoke session
router.delete("/sessions/:sessionId", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { sessionId } = req.params;

  await prisma.userSession.deleteMany({
    where: {
      id: sessionId,
      userId: req.user!.id,
    },
  });

  res.status(200).json({
    success: true,
    message: "Session revoked successfully",
  });
}));

export { router as authRoutes };
