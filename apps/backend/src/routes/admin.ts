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
      where: { status: "DELIVERED" },
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
  if (sort === "newest") { orderBy["createdAt"] = "desc"; }
  else if (sort === "oldest") { orderBy["createdAt"] = "asc"; }
  else { orderBy[sort as string] = order; }

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
  if (sort === "newest") { orderBy["createdAt"] = "desc"; }
  else if (sort === "oldest") { orderBy["createdAt"] = "asc"; }
  else { orderBy[sort as string] = order; }

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
  if (sort === "newest") { orderBy["createdAt"] = "desc"; }
  else if (sort === "oldest") { orderBy["createdAt"] = "asc"; }
  else { orderBy[sort as string] = order; }

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

// Get abandoned carts
router.get("/analytics/abandoned-carts", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const carts = await prisma.cart.findMany({
    where: {
      isActive: true,
      updatedAt: { lt: twoHoursAgo }
    },
    include: {
      items: { include: { variant: { select: { sku: true, price: true } } } }
    },
    orderBy: { updatedAt: "desc" }
  });

  const userIds = carts.map(c => c.userId).filter(Boolean) as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true }
  });

  const formattedCarts = carts.map(cart => {
    const user = cart.userId ? users.find(u => u.id === cart.userId) || null : null;
    const totalValue = cart.items.reduce((sum: number, item: any) => sum + (item.quantity * ((item.variant as any)?.price || 0)), 0);
    return { ...cart, user, totalValue };
  });

  res.status(200).json({ success: true, data: formattedCarts });
}));

// Trigger simulated recovery email
router.post("/analytics/trigger-recovery/:id", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;
  
  // Here we would normally plug into SendGrid, Resend, or AWS SES
  console.log(`[SIMULATION] Triggered Abandoned Cart Email for Cart ID: ${id}`);
  
  // Sleep 1.5s to simulate API network call
  await new Promise(resolve => setTimeout(resolve, 1500));

  res.status(200).json({
    success: true,
    message: "Recovery email queued successfully."
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
        status: "DELIVERED",
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
          status: "DELIVERED",
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
      by: ["productId"],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: "DELIVERED",
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

// Get all promo codes (admin)
router.get("/promos", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    data: promos,
  });
}));

// Create promo code (admin)
router.post("/promos", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { code, description, discountType, discountValue, minPurchase, usageLimit } = req.body;

  if (!code || !discountType || !discountValue) {
    return res.status(400).json({
      success: false,
      message: "Code, discountType, and discountValue are required",
    });
  }

  const existing = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Promo code already exists",
    });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: code.toUpperCase(),
      description: description || null,
      discountType,
      discountValue: parseFloat(discountValue as string),
      minPurchase: minPurchase ? parseFloat(minPurchase as string) : null,
      usageLimit: usageLimit ? parseInt(usageLimit as string) : null,
    },
  });

  res.status(201).json({
    success: true,
    data: promo,
  });
}));

// Update promo code status (admin)
router.put("/promos/:id", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const promo = await prisma.promoCode.update({
    where: { id },
    data: { isActive },
  });

  res.status(200).json({
    success: true,
    data: promo,
  });
}));

// Get business settings
router.get("/settings", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  let settings = await prisma.business.findFirst();
  
  if (!settings) {
    settings = await prisma.business.create({
      data: {
        name: "Ascension",
        email: "contact@ascension.com",
        phone: "+91 9876543210",
        website: "https://ascension.com",
        gstin: "",
        pan: "",
        cin: ""
      }
    });
  }

  res.status(200).json({
    success: true,
    data: settings
  });
}));

// Update business settings
router.put("/settings", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { name, email, phone, website, gstin, pan, cin } = req.body;
  
  let settings = await prisma.business.findFirst();
  
  if (settings) {
    settings = await prisma.business.update({
      where: { id: settings.id },
      data: { name, email, phone, website, gstin, pan, cin }
    });
  } else {
    settings = await prisma.business.create({
      data: { name, email, phone, website, gstin, pan, cin }
    });
  }

  res.status(200).json({
    success: true,
    data: settings
  });
}));


// Get customer details (admin)
router.get("/customers/:id", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      paymentMethods: true,
      orders: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: "Customer not found",
    });
  }

  res.status(200).json({
    success: true,
    data: customer,
  });
}));

// Update customer details (admin)
router.put("/customers/:id", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;
  const { name, email, phone, gender, dateOfBirth, isActive } = req.body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  
  if (gender !== undefined) {
    updateData.gender = gender === "prefer_not" || gender === "prefer-not" ? "PREFER_NOT_TO_SAY" :
                       gender === "non-binary" ? "OTHER" :
                       gender ? gender.toUpperCase() : null;
  }
  
  if (dateOfBirth !== undefined) {
    updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
  }
  
  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  const customer = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
}));

// Delete customer address (admin)
router.delete("/customers/:id/addresses/:addressId", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id, addressId } = req.params;

  await prisma.address.delete({
    where: { id: addressId },
  });

  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
  });
}));

export { router as adminRoutes };
