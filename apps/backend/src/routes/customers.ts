import express from "express";
import { prisma } from "../index";
import { asyncHandler } from "../middleware/errorHandler";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";

const router = express.Router();

router.use(authMiddleware);

// Get customer addresses
router.get("/addresses", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: { isDefault: "desc" },
  });

  res.status(200).json({
    success: true,
    data: addresses,
  });
}));

// Create customer address
router.post("/addresses", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    name,
    line1,
    line2,
    city,
    state,
    postalCode,
    country,
    phone,
    type = "SHIPPING",
    isDefault = false,
  } = req.body;

  if (!name || !line1 || !city || !state || !postalCode || !country || !phone) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "All required fields must be provided",
    });
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.address.updateMany({
      where: { 
        userId: req.user!.id,
        type,
      },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: req.user!.id,
      name,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      phone,
      type,
      isDefault,
    },
  });

  res.status(201).json({
    success: true,
    message: "Address created successfully",
    data: address,
  });
}));

// Update customer address
router.put("/addresses/:id", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if address belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!existingAddress) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Address not found",
    });
  }

  // If setting as default, unset other defaults
  if (updateData.isDefault) {
    await prisma.address.updateMany({
      where: { 
        userId: req.user!.id,
        type: existingAddress.type,
      },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    data: address,
  });
}));

// Delete customer address
router.delete("/addresses/:id", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;

  // Check if address belongs to user
  const existingAddress = await prisma.address.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!existingAddress) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Address not found",
    });
  }

  await prisma.address.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
}));

// Get customer payment methods
router.get("/payment-methods", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { 
      userId: req.user!.id,
      isActive: true,
    },
    orderBy: { isDefault: "desc" },
  });

  res.status(200).json({
    success: true,
    data: paymentMethods,
  });
}));

// Create customer payment method
router.post("/payment-methods", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    type,
    provider,
    last4,
    brand,
    expiryMonth,
    expiryYear,
    isDefault = false,
    token,
    gatewayId,
  } = req.body;

  if (!type || !provider) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Type and provider are required",
    });
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.paymentMethod.updateMany({
      where: { userId: req.user!.id },
      data: { isDefault: false },
    });
  }

  const paymentMethod = await prisma.paymentMethod.create({
    data: {
      userId: req.user!.id,
      type,
      provider,
      last4,
      brand,
      expiryMonth,
      expiryYear,
      isDefault,
      token,
      gatewayId,
    },
  });

  res.status(201).json({
    success: true,
    message: "Payment method created successfully",
    data: paymentMethod,
  });
}));

// Update customer payment method
router.put("/payment-methods/:id", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if payment method belongs to user
  const existingPaymentMethod = await prisma.paymentMethod.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!existingPaymentMethod) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Payment method not found",
    });
  }

  // If setting as default, unset other defaults
  if (updateData.isDefault) {
    await prisma.paymentMethod.updateMany({
      where: { userId: req.user!.id },
      data: { isDefault: false },
    });
  }

  const paymentMethod = await prisma.paymentMethod.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: "Payment method updated successfully",
    data: paymentMethod,
  });
}));

// Delete customer payment method
router.delete("/payment-methods/:id", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;

  // Check if payment method belongs to user
  const existingPaymentMethod = await prisma.paymentMethod.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!existingPaymentMethod) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Payment method not found",
    });
  }

  await prisma.paymentMethod.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "Payment method deleted successfully",
  });
}));

export { router as customerRoutes };
