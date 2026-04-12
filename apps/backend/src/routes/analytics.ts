import express from "express";
import { prisma } from "../index";
import { asyncHandler } from "../middleware/errorHandler";

const router = express.Router();

// Track page views
router.post("/page-view", asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    page,
    referrer,
    userAgent,
    sessionId,
    userId,
  } = req.body;

  await prisma.analytics.create({
    data: {
      event: "PAGE_VIEW",
      data: {
        page,
        referrer,
        userAgent,
      },
      sessionId,
      userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      referrer: req.get("Referrer"),
    },
  });

  res.status(200).json({
    success: true,
    message: "Page view tracked",
  });
}));

// Track product views
router.post("/product-view", asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    productId,
    variantId,
    sessionId,
    userId,
  } = req.body;

  await prisma.analytics.create({
    data: {
      event: "PRODUCT_VIEW",
      data: {
        productId,
        variantId,
      },
      sessionId,
      userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      referrer: req.get("Referrer"),
    },
  });

  res.status(200).json({
    success: true,
    message: "Product view tracked",
  });
}));

// Track add to cart
router.post("/add-to-cart", asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    productId,
    variantId,
    quantity,
    sessionId,
    userId,
  } = req.body;

  await prisma.analytics.create({
    data: {
      event: "ADD_TO_CART",
      data: {
        productId,
        variantId,
        quantity,
      },
      sessionId,
      userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      referrer: req.get("Referrer"),
    },
  });

  res.status(200).json({
    success: true,
    message: "Add to cart tracked",
  });
}));

// Track search
router.post("/search", asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    query,
    filters,
    results,
    sessionId,
    userId,
  } = req.body;

  await prisma.analytics.create({
    data: {
      event: "SEARCH",
      data: {
        query,
        filters,
        results,
      },
      sessionId,
      userId,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      referrer: req.get("Referrer"),
    },
  });

  res.status(200).json({
    success: true,
    message: "Search tracked",
  });
}));

// Get analytics data
router.get("/dashboard", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { period = "30d", event } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const where: any = {
    createdAt: { gte: startDate },
  };

  if (event) {
    where.event = event;
  }

  const analytics = await prisma.analytics.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 1000, // Limit to prevent too much data
  });

  // Aggregate data
  const aggregatedData = analytics.reduce((acc: any, item: any) => {
    const date = item.createdAt.toISOString().split('T')[0] || 'unknown';
    
    if (!acc[date]) {
      acc[date] = {
        pageViews: 0,
        productViews: 0,
        addToCart: 0,
        searches: 0,
        uniqueVisitors: new Set(),
      };
    }

    acc[date][(item.event || '').toLowerCase().replace('_', '')] += 1;
    acc[date].uniqueVisitors.add(item.sessionId);

    return acc;
  }, {});

  // Convert Sets to counts
  Object.keys(aggregatedData).forEach(date => {
    aggregatedData[date].uniqueVisitors = aggregatedData[date].uniqueVisitors.size;
  });

  res.status(200).json({
    success: true,
    data: {
      period,
      startDate,
      endDate: now,
      aggregatedData,
      rawData: analytics.slice(0, 100), // Return last 100 events
    },
  });
}));

// Get popular products
router.get("/popular-products", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { period = "30d", limit = 10 } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const popularProducts = await prisma.analytics.groupBy({
    by: ["data"],
    where: {
      event: "PRODUCT_VIEW",
      createdAt: { gte: startDate },
    },
    _count: { data: true },
    orderBy: {
      _count: { data: "desc" },
    },
    take: Number(limit),
  });

  res.status(200).json({
    success: true,
    data: popularProducts,
  });
}));

// Get conversion funnel
router.get("/conversion-funnel", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { period = "30d" } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const [pageViews, productViews, addToCart, orders] = await Promise.all([
    prisma.analytics.groupBy({
      by: ["event"],
      where: {
        event: "PAGE_VIEW",
        createdAt: { gte: startDate },
      },
      _count: { event: true },
    }),
    prisma.analytics.groupBy({
      by: ["event"],
      where: {
        event: "PRODUCT_VIEW",
        createdAt: { gte: startDate },
      },
      _count: { event: true },
    }),
    prisma.analytics.groupBy({
      by: ["event"],
      where: {
        event: "ADD_TO_CART",
        createdAt: { gte: startDate },
      },
      _count: { event: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: startDate },
        status: "DELIVERED",
      },
      _count: { status: true },
    }),
  ]);

  const pageViewCount = pageViews[0]?._count.event || 0;
  const productViewCount = productViews[0]?._count.event || 0;
  const addToCartCount = addToCart[0]?._count.event || 0;
  const orderCount = orders[0]?._count.status || 0;

  const conversionRates = {
    viewToCart: pageViewCount > 0 ? (addToCartCount / pageViewCount) * 100 : 0,
    cartToOrder: addToCartCount > 0 ? (orderCount / addToCartCount) * 100 : 0,
    viewToOrder: pageViewCount > 0 ? (orderCount / pageViewCount) * 100 : 0,
  };

  res.status(200).json({
    success: true,
    data: {
      period,
      startDate,
      endDate: now,
      funnel: {
        pageViews: pageViewCount,
        productViews: productViewCount,
        addToCart: addToCartCount,
        orders: orderCount,
      },
      conversionRates,
    },
  });
}));

export { router as analyticsRoutes };
