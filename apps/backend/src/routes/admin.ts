import express from "express";
import { prisma } from "../index";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest, adminAuthMiddleware } from "../middleware/auth";

const router = express.Router();

// Dashboard stats
router.get("/dashboard", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const [
    totalOrders,
    totalRevenue,
    totalCustomers,
    totalProducts,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { total: true },
    }),
    prisma.user.count({
      where: { role: "CUSTOMER" },
    }),
    prisma.product.count({
      where: { status: "ACTIVE" },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.inventory.findMany({
      where: {
        availableQuantity: { lte: 10 },
      },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
    }),
  ]);

  const revenue = totalRevenue._sum.total || 0;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalOrders,
        totalRevenue: revenue,
        totalCustomers,
        totalProducts,
      },
      recentOrders,
      lowStockProducts,
    },
  });
}));

// Get all orders (admin)
router.get("/orders", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    page = 1,
    limit = 20,
    status,
    search,
    sort = "createdAt",
    order = "desc",
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};
  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search as string, mode: "insensitive" } },
      { user: { name: { contains: search as string, mode: "insensitive" } } },
      { user: { email: { contains: search as string, mode: "insensitive" } } },
    ];
  }

  // Build order clause
  const orderBy: any = {};
  orderBy[sort as string] = order;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        payment: {
          select: { id: true, status: true, method: true, processedAt: true },
        },
      },
      orderBy,
      skip,
      take: Number(limit),
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.status(200).json({
    success: true,
    data: {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    },
  });
}));

// Get all customers (admin)
router.get("/customers", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    page = 1,
    limit = 20,
    search,
    sort = "createdAt",
    order = "desc",
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = { role: "CUSTOMER" };
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: "insensitive" } },
      { email: { contains: search as string, mode: "insensitive" } },
      { phone: { contains: search as string, mode: "insensitive" } },
    ];
  }

  // Build order clause
  const orderBy: any = {};
  orderBy[sort as string] = order;

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy,
      skip,
      take: Number(limit),
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.status(200).json({
    success: true,
    data: {
      customers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    },
  });
}));

// Get all products (admin)
router.get("/products", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    page = 1,
    limit = 20,
    category,
    search,
    sort = "createdAt",
    order = "desc",
    status,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};
  if (category) {
    where.category = { slug: category as string };
  }

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: "insensitive" } },
      { description: { contains: search as string, mode: "insensitive" } },
      { sku: { contains: search as string, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  // Build order clause
  const orderBy: any = {};
  orderBy[sort as string] = order;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        inventory: true,
        _count: {
          select: { variants: true, reviews: true },
        },
      },
      orderBy,
      skip,
      take: Number(limit),
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    },
  });
}));

// Analytics data
router.get("/analytics", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { period = "30d" } = req.query;

  // Calculate date range based on period
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
    case "1y":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const [
    ordersByStatus,
    revenueByDay,
    topProducts,
    salesByCategory,
    customerGrowth,
  ] = await Promise.all([
    // Orders by status
    prisma.order.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: startDate },
      },
      _count: { status: true },
      _sum: { total: true },
    }),
    // Revenue by day
    prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: "COMPLETED",
      },
      select: {
        createdAt: true,
        total: true,
      },
    }),
    // Top products
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: "COMPLETED",
        },
      },
      _sum: { quantity: true, total: true },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      take: 10,
    }),
    // Sales by category
    prisma.orderItem.groupBy({
      by: ["product"],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: "COMPLETED",
        },
      },
      _sum: { quantity: true, total: true },
    }),
    // Customer growth
    prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: startDate },
        role: "CUSTOMER",
      },
      _count: { createdAt: true },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      period,
      startDate,
      endDate: now,
      ordersByStatus,
      revenueByDay,
      topProducts,
      salesByCategory,
      customerGrowth,
    },
  });
}));

export { router as adminRoutes };
