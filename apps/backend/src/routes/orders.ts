import express from "express";
import { prisma } from "../index";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../middleware/auth";

const router = express.Router();

// Get customer orders
router.get("/", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    page = 1,
    limit = 10,
    status,
    sort = "createdAt",
    order = "desc",
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = { userId: req.user!.id };
  if (status) {
    where.status = status;
  }

  // Build order clause
  const orderBy: any = {};
  orderBy[sort as string] = order;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true },
            },
            variant: {
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

// Get single order
router.get("/:id", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, images: true },
          },
          variant: {
            select: { id: true, name: true, sku: true, images: true },
          },
        },
      },
      payment: true,
      address: true,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Order not found",
    });
  }

  res.status(200).json({
    success: true,
    data: order,
  });
}));

// Create order (checkout)
router.post("/", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    subtotal,
    shippingCost = 0,
    tax = 0,
    discount = 0,
    total,
    notes,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Order items are required",
    });
  }

  if (!shippingAddress || !paymentMethod) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Shipping address and payment method are required",
    });
  }

  // Generate unique order number
  const orderNumber = `ASC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: req.user!.id,
      status: "PENDING",
      subtotal: Number(subtotal),
      shippingCost: Number(shippingCost),
      tax: Number(tax),
      discount: Number(discount),
      total: Number(total),
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          sku: item.sku,
          price: Number(item.price),
          quantity: Number(item.quantity),
          total: Number(item.price * item.quantity),
          image: item.image,
        })),
      },
      payment: {
        create: {
          userId: req.user!.id,
          amount: Number(total),
          method: paymentMethod.type,
          provider: paymentMethod.provider,
          status: "PENDING",
        },
      },
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      payment: true,
    },
  });

  // Update inventory
  for (const item of items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          inventory: {
            decrement: Number(item.quantity),
          },
        },
      });
    } else {
      await prisma.inventory.update({
        where: { productId: item.productId },
        data: {
          quantity: {
            decrement: Number(item.quantity),
          },
        },
      });
    }
  }

  // Clear cart (implement cart clearing logic)
  // await prisma.cartItem.deleteMany({
  //   where: { userId: req.user!.id },
  // });

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order,
  });
}));

// Update order status (admin only)
router.put("/:id/status", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;
  const { status, trackingNumber, carrier, estimatedDelivery } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Status is required",
    });
  }

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Order not found",
    });
  }

  const updateData: any = { status };

  // Add timestamps based on status
  if (status === "SHIPPED") {
    updateData.shippedAt = new Date();
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (carrier) updateData.carrier = carrier;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
  }

  if (status === "DELIVERED") {
    updateData.deliveredAt = new Date();
  }

  if (status === "CANCELLED") {
    updateData.cancelledAt = new Date();
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      items: true,
      payment: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: updatedOrder,
  });
}));

// Cancel order (customer)
router.post("/:id/cancel", asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await prisma.order.findFirst({
    where: { 
      id,
      userId: req.user!.id,
    },
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Order not found",
    });
  }

  if (order.status !== "PENDING" && order.status !== "PROCESSING") {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Order cannot be cancelled at this stage",
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      internalNotes: reason ? `Customer cancellation: ${reason}` : "Customer cancelled order",
    },
  });

  // Restore inventory
  for (const item of order.items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          inventory: {
            increment: item.quantity,
          },
        },
      });
    } else {
      await prisma.inventory.update({
        where: { productId: item.productId },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
    data: updatedOrder,
  });
}));

export { router as orderRoutes };
