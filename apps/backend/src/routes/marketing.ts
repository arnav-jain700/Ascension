import express from "express";
import { prisma } from "../index";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

// Subscribe to newsletter
router.post("/subscribe", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { email, source } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Validation Error", message: "Email is required" });
  }

  // Upsert subscriber to handle cases where they unsubscribed and want to resubscribe
  const subscriber = await prisma.subscriber.upsert({
    where: { email },
    update: { isActive: true, ...(source && { source }) },
    create: { email, ...(source && { source }) }
  });

  res.status(200).json({
    success: true,
    message: "Subscribed successfully",
    data: subscriber
  });
}));

// Validate promo code
router.post("/validate-promo", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { code, cartTotal } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "Validation Error", message: "Promo code required" });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (!promo || !promo.isActive) {
    return res.status(404).json({ success: false, error: "Not Found", message: "Invalid or inactive promo code" });
  }

  if (promo.endDate && new Date(promo.endDate) < new Date()) {
    return res.status(400).json({ success: false, error: "Expired", message: "This promo code has expired" });
  }

  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    return res.status(400).json({ success: false, error: "Limit Reached", message: "This promo code usage limit has been reached" });
  }
  
  if (cartTotal && promo.minPurchase && cartTotal < promo.minPurchase) {
      return res.status(400).json({ success: false, error: "Minimum Not Met", message: `This promo code requires a minimum purchase of ₹${promo.minPurchase}` });
  }

  res.status(200).json({
    success: true,
    data: promo
  });
}));

export { router as marketingRoutes };
