import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../index";
import { asyncHandler } from "../middleware/errorHandler";
import { authMiddleware, optionalAuthMiddleware, AuthenticatedRequest } from "../middleware/auth";

const router = express.Router();

// Create Razorpay Order
router.post("/razorpay/create", optionalAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });

  const { orderNumber, amount } = req.body;

  if (!orderNumber || !amount) {
    return res.status(400).json({ success: false, message: "orderNumber and amount are required" });
  }

  // Find the internal Ascension order
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payment: true },
  });

  if (!order || !order.payment) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Amount in Paise
  const options = {
    amount: Math.round(Number(amount) * 100),
    currency: "INR",
    receipt: orderNumber,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  await prisma.payment.update({
    where: { id: order.payment.id },
    data: { providerOrderId: razorpayOrder.id },
  });

  res.status(200).json({
    success: true,
    data: {
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  });
}));

// Verify Razorpay Order Signature
router.post("/razorpay/verify", asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderNumber
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderNumber) {
    return res.status(400).json({ success: false, message: "Missing required signature fields" });
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  // Signature is valid, update the order
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payment: true },
  });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  // Mark Order as PROCESSING (paid)
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "PROCESSING" },
  });

  // Mark Payment as COMPLETED
  if (order.payment) {
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status: "COMPLETED",
        transactionId: razorpay_payment_id,
        gatewayResponse: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
        processedAt: new Date(),
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "Payment successfully verified",
  });
}));

export { router as paymentRoutes };
