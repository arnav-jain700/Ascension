import express from "express";
import { prisma } from "../index";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest, adminAuthMiddleware } from "../middleware/auth";

const router = express.Router();

// Get all products (public endpoint)
router.get("/", asyncHandler(async (req: express.Request, res: express.Response) => {
  const {
    page = 1,
    limit = 20,
    category,
    search,
    sort = "createdAt",
    order = "desc",
    featured,
    status = "ACTIVE",
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = { status };

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

  if (featured === "true") {
    where.featured = true;
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
        variants: {
          where: { isActive: true },
          include: {
            images: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        images: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        inventory: true,
        _count: {
          select: { reviews: true },
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

// Get single product by slug (public endpoint)
router.get("/:slug", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      variants: {
        where: { isActive: true },
        include: {
          images: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      images: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      inventory: true,
      reviews: {
        where: { isActive: true },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Product not found",
    });
  }

  res.status(200).json({
    success: true,
    data: product,
  });
}));

// Get product variants
router.get("/:slug/variants", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Product not found",
    });
  }

  const variants = await prisma.productVariant.findMany({
    where: { 
      productId: product.id,
      isActive: true,
    },
    include: {
      images: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  res.status(200).json({
    success: true,
    data: variants,
  });
}));

// Create product (admin only)
router.post("/", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const {
    name,
    description,
    sku,
    price,
    comparePrice,
    cost,
    weight,
    dimensions,
    tags,
    categoryId,
    status = "ACTIVE",
    featured = false,
    seoTitle,
    seoDescription,
  } = req.body;

  // Validate required fields
  if (!name || !description || !sku || !price) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Name, description, SKU, and price are required",
    });
  }

  // Check if SKU already exists
  const existingProduct = await prisma.product.findUnique({
    where: { sku },
  });

  if (existingProduct) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Product with this SKU already exists",
    });
  }

  // Generate slug from name
  let slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Ensure unique slug
  let uniqueSlug = slug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug: uniqueSlug,
      description,
      sku,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      cost: cost ? Number(cost) : null,
      weight: weight ? Number(weight) : null,
      dimensions,
      tags: tags || [],
      categoryId: categoryId || null,
      status,
      featured,
      seoTitle,
      seoDescription,
    },
    include: {
      category: true,
      variants: true,
      images: true,
      inventory: true,
    },
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
}));

// Update product (admin only)
router.put("/:id", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Product not found",
    });
  }

  // If SKU is being updated, check for uniqueness
  if (updateData.sku && updateData.sku !== product.sku) {
    const existingProduct = await prisma.product.findUnique({
      where: { sku: updateData.sku },
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Product with this SKU already exists",
      });
    }
  }

  // Update numeric fields
  if (updateData.price) updateData.price = Number(updateData.price);
  if (updateData.comparePrice) updateData.comparePrice = Number(updateData.comparePrice);
  if (updateData.cost) updateData.cost = Number(updateData.cost);
  if (updateData.weight) updateData.weight = Number(updateData.weight);

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      variants: true,
      images: true,
      inventory: true,
    },
  });

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
}));

// Delete product (admin only)
router.delete("/:id", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Product not found",
    });
  }

  await prisma.product.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
}));

// Get categories
router.get("/categories/list", asyncHandler(async (req: express.Request, res: express.Response) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      parent: {
        select: { id: true, name: true },
      },
      children: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  res.status(200).json({
    success: true,
    data: categories,
  });
}));

// Create category (admin only)
router.post("/categories", adminAuthMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { name, description, parentId, image, sortOrder = 0 } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Category name is required",
    });
  }

  // Generate slug
  let slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Ensure unique slug
  let uniqueSlug = slug;
  let counter = 1;
  while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug: uniqueSlug,
      description,
      parentId: parentId || null,
      image,
      sortOrder,
    },
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
}));

export { router as productRoutes };
