import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT) || 4001;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json());

// Mock data
const mockProducts = [
  {
    id: "1",
    name: "Men's Essential Tee",
    slug: "mens-essential-tee",
    description: "Premium quality men's t-shirt made from comfortable cotton fabric.",
    category: "tshirt",
    gender: "men",
    basePrice: 1299,
    imageUrls: ["/placeholder-product.jpg"],
    variants: [
      {
        id: "1-1",
        size: "M",
        color: "black",
        sku: "MTEE-BLK-M",
        stockQuantity: 50,
        price: 1299,
      },
      {
        id: "1-2",
        size: "L",
        color: "black",
        sku: "MTEE-BLK-L",
        stockQuantity: 30,
        price: 1299,
      },
    ],
    inStock: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Women's Essential Tee",
    slug: "womens-essential-tee",
    description: "Premium quality women's t-shirt made from comfortable cotton fabric.",
    category: "tshirt",
    gender: "women",
    basePrice: 1299,
    imageUrls: ["/placeholder-product.jpg"],
    variants: [
      {
        id: "2-1",
        size: "M",
        color: "black",
        sku: "WTEE-BLK-M",
        stockQuantity: 40,
        price: 1299,
      },
      {
        id: "2-2",
        size: "L",
        color: "black",
        sku: "WTEE-BLK-L",
        stockQuantity: 25,
        price: 1299,
      },
    ],
    inStock: true,
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Men's Joggers",
    slug: "mens-joggers",
    description: "Comfortable and stylish men's joggers perfect for everyday wear.",
    category: "jogger",
    gender: "men",
    basePrice: 2499,
    imageUrls: ["/placeholder-product.jpg"],
    variants: [
      {
        id: "3-1",
        size: "M",
        color: "navy",
        sku: "MJOG-NAV-M",
        stockQuantity: 20,
        price: 2499,
      },
      {
        id: "3-2",
        size: "L",
        color: "navy",
        sku: "MJOG-NAV-L",
        stockQuantity: 15,
        price: 2499,
      },
    ],
    inStock: true,
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Women's Joggers",
    slug: "womens-joggers",
    description: "Comfortable and stylish women's joggers perfect for everyday wear.",
    category: "jogger",
    gender: "women",
    basePrice: 2499,
    imageUrls: ["/placeholder-product.jpg"],
    variants: [
      {
        id: "4-1",
        size: "M",
        color: "gray",
        sku: "WJOG-GRY-M",
        stockQuantity: 18,
        price: 2499,
      },
      {
        id: "4-2",
        size: "L",
        color: "gray",
        sku: "WJOG-GRY-L",
        stockQuantity: 12,
        price: 2499,
      },
    ],
    inStock: true,
    createdAt: new Date(),
  },
];

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ascension-api", database: "mock" });
});

app.get("/api/v1", (_req, res) => {
  res.json({ name: "Ascension API", version: "0.0.1" });
});

// GET /api/v1/products - Get all products with filtering and sorting
app.get("/api/v1/products", (req, res) => {
  try {
    const {
      category,
      gender,
      size,
      color,
      sort = "newest",
      page = "1",
      limit = "12",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Filter mock products
    let filteredProducts = mockProducts;

    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (gender && gender !== "all") {
      filteredProducts = filteredProducts.filter(p => p.gender === gender);
    }

    if (size) {
      filteredProducts = filteredProducts.filter(p => 
        p.variants.some((v: any) => v.size === size)
      );
    }

    if (color) {
      filteredProducts = filteredProducts.filter(p => 
        p.variants.some((v: any) => v.color === color)
      );
    }

    // Sort products
    let sortedProducts = [...filteredProducts];
    switch (sort) {
      case "price-asc":
        sortedProducts.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "newest":
        sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        sortedProducts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    // Pagination
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limitNum),
        hasNext: endIndex < filteredProducts.length,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/v1/products/:slug - Get single product by slug
app.get("/api/v1/products/:slug", (req, res) => {
  try {
    const { slug } = req.params;

    const product = mockProducts.find(p => 
      p.slug === slug || p.slug === slug.replace(/-/g, " ")
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.listen(port, () => {
  console.log(`Ascension API (mock) listening on http://localhost:${port}`);
});
