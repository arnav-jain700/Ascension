
const formatUser = (u: any) => {
  if (!u) return u;
  const parts = (u.name || "").split(" ");
  return {
    ...u,
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    name: undefined
  };
};

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { prisma } from "../index";
import { asyncHandler } from "../middleware/errorHandler";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { sendWelcomeEmail } from "../services/emailService";
import crypto from "crypto";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: "Too many attempts from this IP, please try again after 15 minutes"
});

// Generate JWT token
const generateToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any }
  );
};

// Register new user
router.post("/register", authLimiter, asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    name,
    email,
    password,
    phone,
    dateOfBirth,
    gender,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
  } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Name, email, and password are required",
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
      name,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender === "prefer-not" ? "PREFER_NOT_TO_SAY" :
              gender === "non-binary" ? "OTHER" :
              gender ? gender.toUpperCase() : null,
      addresses: addressLine1 ? {
        create: {
          name: `${name} - Primary`,
          line1: addressLine1,
          line2: addressLine2 || null,
          city: city || "",
          state: state || "",
          postalCode: postalCode || "",
          country: country || "India",
          phone: phone || "",
          isDefault: true,
          type: "SHIPPING"
        }
      } : undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      addresses: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Generate Verification Token
  const verifyToken = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: verifyToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }
  });

  // Send Email
  await sendWelcomeEmail(user.email, user.name, verifyToken);

  res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email.",
    data: {
      user: formatUser(user),
      sessionToken: null,
    },
  });
}));

// Verify Email
router.post("/verify", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: "Token required" });

  const vt = await prisma.verificationToken.findFirst({
    where: { token, expires: { gt: new Date() } }
  });

  if (!vt) return res.status(400).json({ success: false, message: "Invalid or expired token" });

  await prisma.user.update({
    where: { email: vt.identifier },
    data: { emailVerified: true, emailVerifiedAt: new Date() }
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: vt.identifier }
  });

  res.status(200).json({ success: true, message: "Email verified successfully!" });
}));

// Login user
router.post("/login", authLimiter, asyncHandler(async (req: express.Request, res: express.Response) => {
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
      name: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      isActive: true,
      passwordHash: true,
      lastLoginAt: true,
      addresses: true,
      isTwoFactorEnabled: true,
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

  if (!user.emailVerified) {
    return res.status(401).json({
      success: false,
      error: "Authentication Error",
      message: "Please verify your email address before logging in. Check your inbox.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: "Authentication Error",
      message: "Invalid email or password",
    });
  }

  // Intercept for 2FA flow
  if (user.isTwoFactorEnabled) {
    // Generate a temporary 5-minute token for 2FA validation
    const tempToken = jwt.sign(
      { id: user.id, requires2FA: true },
      process.env.JWT_SECRET!,
      { expiresIn: "5m" }
    );
    
    return res.status(202).json({
      success: true,
      message: "Two-Factor Authentication required",
      data: {
        requires2FA: true,
        tempToken,
      }
    });
  }

  // Generate standard token
  const token = generateToken(user.id);

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken: token,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Remove password from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: formatUser(userWithoutPassword),
      sessionToken: token,
    },
  });
}));

// Complete 2FA Login
router.post("/2fa/login", authLimiter, asyncHandler(async (req: express.Request, res: express.Response) => {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    return res.status(400).json({ success: false, message: "Missing tracking constraints" });
  }

  try {
    const payload = jwt.verify(tempToken, process.env.JWT_SECRET!) as { id: string, requires2FA: boolean };
    
    if (!payload.requires2FA) {
      throw new Error();
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true, email: true, name: true, phone: true, dateOfBirth: true,
        gender: true, emailVerified: true, isActive: true, 
        isTwoFactorEnabled: true, twoFactorSecret: true,
        lastLoginAt: true, addresses: true,
      }
    });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return res.status(401).json({ success: false, message: "Invalid session or 2FA not configured" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1 // allows 30 seconds drift back and forward
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: "Invalid authenticator code" });
    }

    // Success, mint real token
    const token = generateToken(user.id);
    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: token,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { twoFactorSecret: _, ...userNoSecret } = user;

    res.status(200).json({
      success: true,
      message: "2FA Login successful",
      data: {
        user: formatUser(userNoSecret),
        sessionToken: token,
      },
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session block" });
  }
}));

// Logout user
router.post("/logout", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.substring(7);

  if (token) {
    // Delete session
    await prisma.session.deleteMany({
      where: { sessionToken: token },
    });
  }

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}));

// Get current user profile
router.get("/profile", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      addresses: true,
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
    data: formatUser(user),
  });
}));

// Update user profile
router.put("/profile", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    firstName,
    lastName,
    phone,
    dateOfBirth,
    gender,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country
  } = req.body;

  const updateData: any = {};

  if (firstName || lastName) {
    const currentParts = (req.user as any).name?.split(" ") || [];
    const first = firstName || currentParts[0] || "";
    const last = lastName || currentParts.slice(1).join(" ") || "";
    updateData.name = `${first} ${last}`.trim();
  }
  if (phone) updateData.phone = phone;
  if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
  
  if (gender) {
    const mappedGender = gender === "prefer_not" || gender === "prefer-not" ? "PREFER_NOT_TO_SAY" :
                         gender === "non-binary" ? "OTHER" :
                         gender.toUpperCase();
    updateData.gender = mappedGender;
  } else {
    updateData.gender = null;
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
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

  // Handle address update or creation
  if (addressLine1 && city && state && postalCode && country) {
    const existingAddress = await prisma.address.findFirst({
      where: { userId: req.user!.id, isDefault: true }
    });

    if (existingAddress) {
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: {
          line1: addressLine1,
          line2: addressLine2 || null,
          city,
          state,
          postalCode,
          country,
          phone: phone || existingAddress.phone
        }
      });
    } else {
      await prisma.address.create({
        data: {
          userId: req.user!.id,
          name: user.name + " - Primary",
          line1: addressLine1,
          line2: addressLine2 || null,
          city,
          state,
          postalCode,
          country,
          phone: phone || "",
          isDefault: true,
          type: "SHIPPING"
        }
      });
    }
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      emailVerified: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      addresses: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: formatUser(updatedUser),
  });
}));

// Change password
router.put("/change-password", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
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
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "User not found",
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

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
    data: { passwordHash: hashedNewPassword, passwordChangedAt: new Date() },
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
}));

// Get user sessions
router.get("/sessions", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const sessions = await prisma.session.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });

  const authHeader = req.headers.authorization;
  const currentToken = authHeader?.substring(7);

  const mappedSessions = sessions.map(s => {
    let ua = s.userAgent || "";
    let ip = s.ipAddress || "";
    
    // Self-healing legacy sessions naturally missing footprint columns
    if (s.sessionToken === currentToken) {
      if (!ua) ua = req.headers["user-agent"] || "";
      if (!ip) ip = req.ip || "";
      
      // Fire-and-forget DB update to permanently heal it without awaiting
      if (!s.userAgent || !s.ipAddress) {
        prisma.session.update({
          where: { id: s.id },
          data: { userAgent: ua, ipAddress: ip }
        }).catch(() => {});
      }
    }

    // Basic UserAgent parsing
    let deviceName = "Unknown Device";
    let browserName = "Unknown Browser";
    
    if (ua.includes("Windows NT 10.0") || ua.includes("Windows NT 11.0")) deviceName = "Windows PC";
    else if (ua.includes("Mac OS X")) deviceName = "MacBook / iMac";
    else if (ua.includes("iPhone")) deviceName = "iPhone";
    else if (ua.includes("iPad")) deviceName = "iPad";
    else if (ua.includes("Android")) deviceName = "Android Device";
    else if (ua) deviceName = "Desktop Device";
    
    if (ua.includes("Chrome") && !ua.includes("Edg")) browserName = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browserName = "Safari";
    else if (ua.includes("Firefox")) browserName = "Firefox";
    else if (ua.includes("Edg")) browserName = "Edge";
    // Also catch some common generic strings
    else if (ua) browserName = "Modern Browser";

    let cleanIp = ip || "Unknown";
    let loc = "Unknown Location";
    if (cleanIp === "::1" || cleanIp === "127.0.0.1") {
      cleanIp = "127.0.0.1";
      loc = "Localhost";
    }

    return {
      id: s.id,
      device: deviceName,
      browser: browserName,
      location: loc,
      ipAddress: cleanIp,
      lastActive: (s as any).updatedAt || (s as any).createdAt || s.expires,
      isCurrent: s.sessionToken === currentToken,
    };
  });

  res.status(200).json({
    success: true,
    data: mappedSessions,
  });
}));

// Revoke all OTHER sessions
router.delete("/sessions", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const authHeader = req.headers.authorization;
  const currentToken = authHeader?.substring(7);

  if (!currentToken) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  await prisma.session.deleteMany({
    where: {
      userId: req.user!.id,
      sessionToken: { not: currentToken },
    },
  });

  res.status(200).json({
    success: true,
    message: "All other sessions revoked successfully",
  });
}));

// Get security settings
router.get("/security/settings", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { settings: true, passwordChangedAt: true, isTwoFactorEnabled: true },
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({
    success: true,
    data: {
      settings: user.settings || {},
      passwordChangedAt: user.passwordChangedAt,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    },
  });
}));

// Update security settings
router.put("/security/settings", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  // Simple payload sanitization (strip extra attributes outside expected keys, enforce JSON scalar blocks)
  const allowedKeys = ["emailNotifications", "smsNotifications", "loginAlerts", "sessionTimeout", "fitProfile"];
  const sanitizedSettings: any = {};
  
  if (req.body && typeof req.body === 'object') {
    for (const key of allowedKeys) {
      if (req.body.hasOwnProperty(key)) {
        sanitizedSettings[key] = req.body[key];
      }
    }
  }

  // We need to merge with existing settings, not completely overwrite!
  const userTemp = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { settings: true } });
  let existingSettings = {};
  if (userTemp?.settings && typeof userTemp.settings === 'object') {
    existingSettings = userTemp.settings;
  }

  const finalSettings = { ...existingSettings, ...sanitizedSettings };
  
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { settings: finalSettings },
  });

  res.status(200).json({
    success: true,
    message: "Security settings updated successfully",
  });
}));

// Generate 2FA Secret
router.post("/2fa/generate", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const secret = speakeasy.generateSecret({ 
    name: `Ascension (${req.user!.email})` 
  });
  
  const dataUrl = await qrcode.toDataURL(secret.otpauth_url!);

  // Save temporary secret to user (it is not considered "enabled" yet)
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { twoFactorSecret: secret.base32 },
  });

  res.status(200).json({
    success: true,
    data: {
      secret: secret.base32,
      qrCodeUrl: dataUrl
    }
  });
}));

// Verify and Enable 2FA
router.post("/2fa/verify", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: "Code parameter required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { twoFactorSecret: true }
  });

  if (!user || !user.twoFactorSecret) {
    return res.status(400).json({ success: false, message: "2FA generation must be invoked first" });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1
  });

  if (verified) {
    // Official enable
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { isTwoFactorEnabled: true }
    });

    res.status(200).json({
      success: true,
      message: "Two-Factor authentication has been successfully verified and enabled.",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Provided code is invalid. Please ensure time sync and try again.",
    });
  }
}));

// Revoke session
router.delete("/sessions/:sessionId", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { sessionId } = req.params;

  await prisma.session.deleteMany({
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

// Delete user account
router.delete("/account", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const userId = req.user!.id;

  // We need to physically extract and obliterate all user data to honor full deletion
  await prisma.$transaction([
    prisma.payment.deleteMany({
      where: { userId }
    }),
    prisma.order.deleteMany({
      where: { userId }
    }),
    prisma.review.deleteMany({
      where: { userId }
    }),
    prisma.wishlistItem.deleteMany({
      where: { userId }
    }),
    prisma.wishlist.deleteMany({
      where: { userId }
    }),
    prisma.cartItem.deleteMany({
      where: { userId }
    }),
    prisma.cart.deleteMany({
      where: { userId }
    }),
    prisma.user.delete({
      where: { id: userId },
    })
  ]);

  res.status(200).json({
    success: true,
    message: "Account and all scattered data deleted successfully",
  });
}));

export { router as authRoutes };
