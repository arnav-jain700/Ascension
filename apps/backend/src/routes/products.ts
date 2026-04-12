import express from "express";
import { prisma } from "../index";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest, adminAuthMiddleware, authMiddleware } from "../middleware/auth";

const router = express.Router();

const mapProductForFrontend = (p: any, siblings: any[] = []) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  category: "Uncategorized",
  basePrice: p.price || 0,
  imageUrls: p.images?.map((img: any) => img.url) || [],
  variants: p.variants?.map((v: any) => ({
    id: v.id,
    size: v.name || "",
    color: p.color || "",
    sku: v.sku,
    stockQuantity: v.inventory || 0,
    price: v.price || p.price
  })) || [],
  inStock: p.inventory ? p.inventory.availableQuantity > 0 : (p.variants?.some((v: any) => v.inventory > 0) || true),
  color: p.color,
  siblingColors: siblings.filter((s: any) => s.sku === p.sku && s.id !== p.id),
  createdAt: p.createdAt,
  reviews: p.reviews,
});


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
    gender,
    minPrice,
    maxPrice,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = { status };

  if (gender && gender !== "all") {
    const genderTag = (gender as string).toLowerCase();
    where.tags = { hasSome: [genderTag, "unisex"] };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
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
  if (sort === "newest") { orderBy["createdAt"] = "desc"; }
  else if (sort === "oldest") { orderBy["createdAt"] = "asc"; }
  else if (sort === "price-asc") { orderBy["price"] = "asc"; }
  else if (sort === "price-desc") { orderBy["price"] = "desc"; }
  else { orderBy[sort as string] = order; }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
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

  // Attach sibling products (same SKU)
  const skuList = products.map((p: any) => p.sku).filter(Boolean);
  const siblings = await prisma.product.findMany({
    where: { sku: { in: skuList }, status: "ACTIVE" },
    select: { 
      id: true, 
      slug: true, 
      sku: true, 
      color: true, 
      images: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 1 } 
    }
  });

  const productsWithSiblings = products.map((p: any) => mapProductForFrontend(p, siblings));

  const totalPages = Math.ceil(total / Number(limit));

  res.status(200).json({
    success: true,
    data: {
      products: productsWithSiblings,
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
            select: { id: true, name: true },
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

  // Attach sibling products
  const siblings = await prisma.product.findMany({
    where: { sku: product.sku, status: "ACTIVE" },
    select: { 
      id: true, 
      slug: true, 
      sku: true, 
      color: true, 
      images: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 1 } 
    }
  });

  const productWithSiblings = mapProductForFrontend(product, siblings);

  res.status(200).json({
    success: true,
    data: productWithSiblings,
  });
}));

// Get product recommendations
router.get("/:slug/recommendations", asyncHandler(async (req: express.Request, res: express.Response) => {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, tags: true },
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Product not found",
    });
  }

  const orConditions: any[] = [];

  if (product.tags && product.tags.length > 0) {
    orConditions.push({ tags: { hasSome: product.tags } });
  }

  const recommendations = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      status: "ACTIVE",
      ...(orConditions.length > 0 ? { OR: orConditions } : {})
    },
    include: {
      images: { where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true } }
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const recommendationsData = recommendations.map((p: any) => mapProductForFrontend(p));

  res.status(200).json({
    success: true,
    data: recommendationsData,
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
    color,
    price,
    comparePrice,
    cost,
    weight,
    dimensions,
    tags,
    status = "ACTIVE",
    featured = false,
    seoTitle,
    seoDescription,
    images = [],
    sizes = [],
  } = req.body;

  // Validate required fields
  if (!name || !description || !sku || !price) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Name, description, SKU, and price are required",
    });
  }

  // SKU uniqueness has been relaxed to act as a style code

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
      color,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      cost: cost ? Number(cost) : null,
      weight: weight ? Number(weight) : null,
      dimensions,
      tags: tags || [],
      status,
      featured,
      seoTitle,
      seoDescription,
      images: images && images.length > 0 ? {
        create: images.map((img: any, index: number) => ({
          url: img.url || img,
          sortOrder: index,
          isActive: true
        }))
      } : undefined,
      variants: sizes && sizes.length > 0 ? {
        create: sizes.map((size: string) => ({
          name: size,
          sku: `${sku}-${size.toUpperCase()}`,
          price: Number(price),
          inventory: 10,
        }))
      } : undefined,
    },
    include: {
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

  // Remove SKU uniqueness bounds

  // Update numeric fields
  if (updateData.price) updateData.price = Number(updateData.price);
  if (updateData.comparePrice) updateData.comparePrice = Number(updateData.comparePrice);
  if (updateData.cost) updateData.cost = Number(updateData.cost);
  if (updateData.weight) updateData.weight = Number(updateData.weight);

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
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

// Submit a product review (authenticated)
router.post("/:slug/reviews", authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { slug } = req.params;
  const { rating, title, content } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: "Validation",
      message: "A rating between 1 and 5 is required"
    });
  }

  const product = await prisma.product.findUnique({
    where: { slug }
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: "Not Found",
      message: "Product not found"
    });
  }

  // Check if they actually bought it to mark as verified
  const hasPurchased = await prisma.order.findFirst({
    where: {
      userId: req.user!.id,
      status: "DELIVERED",
      items: {
        some: { productId: product.id }
      }
    }
  });

  if (!hasPurchased) {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Only verified buyers who have received this item can leave a review."
    });
  }

  const review = await prisma.review.upsert({
    where: {
      productId_userId: {
        productId: product.id,
        userId: req.user!.id
      }
    },
    update: {
      rating: Number(rating),
      title,
      content,
    },
    create: {
      productId: product.id,
      userId: req.user!.id,
      rating: Number(rating),
      title,
      content,
      isVerified: true
    }
  });

  res.status(200).json({
    success: true,
    message: "Review submitted successfully",
    data: review
  });
}));

export { router as productRoutes };
