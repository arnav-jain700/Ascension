import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mock admin dashboard data
app.get("/api/v1/admin/dashboard", (req, res) => {
  res.json({
    success: true,
    data: {
      stats: {
        totalOrders: 156,
        totalRevenue: 245678,
        totalCustomers: 89,
        totalProducts: 45
      },
      recentOrders: [
        {
          id: "1",
          orderNumber: "ORD-001",
          total: 1299,
          status: "COMPLETED",
          user: { name: "John Doe", email: "john@example.com" }
        },
        {
          id: "2", 
          orderNumber: "ORD-002",
          total: 899,
          status: "PROCESSING",
          user: { name: "Jane Smith", email: "jane@example.com" }
        }
      ],
      lowStockProducts: []
    }
  });
});

// Mock products data
app.get("/api/v1/admin/products", (req, res) => {
  res.json({
    success: true,
    data: {
      products: [
        {
          id: "1",
          name: "Premium T-Shirt",
          sku: "TSHIRT-001",
          price: 599,
          status: "ACTIVE",
          category: "T-Shirts",
          gender: "men",
          slug: "premium-t-shirt-men",
          basePrice: 599,
          inStock: true,
          imageUrls: ["/images/products/men-tshirt-1.jpg", "/images/products/men-tshirt-2.jpg"],
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          name: "Classic Joggers",
          sku: "JOGGER-001", 
          price: 999,
          status: "ACTIVE",
          category: "Bottoms",
          gender: "men",
          slug: "classic-joggers-men",
          basePrice: 999,
          inStock: true,
          imageUrls: ["/images/products/men-joggers-1.jpg", "/images/products/men-joggers-2.jpg"],
          createdAt: new Date().toISOString()
        },
        {
          id: "3",
          name: "Women's Premium T-Shirt",
          sku: "TSHIRT-W001",
          price: 649,
          status: "ACTIVE",
          category: "T-Shirts",
          gender: "women",
          slug: "premium-t-shirt-women",
          basePrice: 649,
          inStock: true,
          imageUrls: ["/images/products/women-tshirt-1.jpg", "/images/products/women-tshirt-2.jpg"],
          createdAt: new Date().toISOString()
        },
        {
          id: "4",
          name: "Women's Classic Joggers",
          sku: "JOGGER-W001", 
          price: 1099,
          status: "ACTIVE",
          category: "Bottoms",
          gender: "women",
          slug: "classic-joggers-women",
          basePrice: 1099,
          inStock: true,
          imageUrls: ["/images/products/women-joggers-1.jpg", "/images/products/women-joggers-2.jpg"],
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 4,
        totalPages: 1
      }
    }
  });
});

// Mock products endpoint with gender filter
app.get("/api/v1/products", (req, res) => {
  const { gender, page = 1, limit = 12 } = req.query;
  
  let products = [
    {
      id: "1",
      name: "Premium T-Shirt",
      sku: "TSHIRT-001",
      price: 599,
      status: "ACTIVE",
      category: "T-Shirts",
      gender: "men",
      slug: "premium-t-shirt-men",
      basePrice: 599,
      inStock: true,
      imageUrls: ["/images/products/men-tshirt-1.jpg", "/images/products/men-tshirt-2.jpg"],
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "Classic Joggers",
      sku: "JOGGER-001", 
      price: 999,
      status: "ACTIVE",
      category: "Bottoms",
      gender: "men",
      slug: "classic-joggers-men",
      basePrice: 999,
      inStock: true,
      imageUrls: ["/images/products/men-joggers-1.jpg", "/images/products/men-joggers-2.jpg"],
      createdAt: new Date().toISOString()
    },
    {
      id: "3",
      name: "Women's Premium T-Shirt",
      sku: "TSHIRT-W001",
      price: 649,
      status: "ACTIVE",
      category: "T-Shirts",
      gender: "women",
      slug: "premium-t-shirt-women",
      basePrice: 649,
      inStock: true,
      imageUrls: ["/images/products/women-tshirt-1.jpg", "/images/products/women-tshirt-2.jpg"],
      createdAt: new Date().toISOString()
    },
    {
      id: "4",
      name: "Women's Classic Joggers",
      sku: "JOGGER-W001", 
      price: 1099,
      status: "ACTIVE",
      category: "Bottoms",
      gender: "women",
      slug: "classic-joggers-women",
      basePrice: 1099,
      inStock: true,
      imageUrls: ["/images/products/women-joggers-1.jpg", "/images/products/women-joggers-2.jpg"],
      createdAt: new Date().toISOString()
    }
  ];

  // Filter by gender if specified
  if (gender) {
    products = products.filter(p => p.gender === gender);
  }

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: products.length,
        totalPages: 1
      }
    }
  });
});

// Mock orders data
app.get("/api/v1/admin/orders", (req, res) => {
  res.json({
    success: true,
    data: {
      orders: [
        {
          id: "1",
          orderNumber: "ORD-001",
          status: "COMPLETED",
          total: 1299,
          createdAt: new Date().toISOString(),
          user: { name: "John Doe", email: "john@example.com" },
          payment: { status: "COMPLETED", method: "CREDIT_CARD" },
          items: [
            { name: "Premium T-Shirt", quantity: 2, price: 599 }
          ]
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    }
  });
});

// Mock customers data
app.get("/api/v1/admin/customers", (req, res) => {
  res.json({
    success: true,
    data: {
      customers: [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+91 98765 43210",
          isActive: true,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          _count: { orders: 3 }
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    }
  });
});

// Mock analytics data
app.get("/api/v1/admin/analytics", (req, res) => {
  res.json({
    success: true,
    data: {
      period: "30d",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
      ordersByStatus: [
        { status: "COMPLETED", _count: { status: 120 }, _sum: { total: 180000 } },
        { status: "PROCESSING", _count: { status: 25 }, _sum: { total: 35000 } },
        { status: "PENDING", _count: { status: 11 }, _sum: { total: 15000 } }
      ],
      topProducts: [
        { productId: "1", _sum: { quantity: 45, total: 26955 } },
        { productId: "2", _sum: { quantity: 32, total: 31968 } }
      ],
      salesByCategory: [],
      customerGrowth: []
    }
  });
});

// Mock settings endpoints
app.get("/api/v1/admin/settings", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "Ascension",
      email: "info@ascension.com",
      phone: "+91 98765 43210",
      website: "https://ascension.com",
      gstin: "29ABCDE1234F1ZV",
      pan: "ABCDE1234F",
      cin: "U12345MH2023PTC123456"
    }
  });
});

app.put("/api/v1/admin/settings", (req, res) => {
  res.json({
    success: true,
    message: "Settings updated successfully"
  });
});

// Mock customer update endpoint
app.put("/api/v1/admin/customers/:id", (req, res) => {
  res.json({
    success: true,
    message: "Customer updated successfully"
  });
});

// Mock order status update
app.put("/api/v1/orders/:id/status", (req, res) => {
  res.json({
    success: true,
    message: "Order status updated successfully"
  });
});

// Mock product endpoints
app.delete("/api/v1/products/:id", (req, res) => {
  res.json({
    success: true,
    message: "Product deleted successfully"
  });
});

app.get("/api/v1/products/:id", (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      name: "Premium T-Shirt",
      sku: "TSHIRT-001",
      price: 599,
      status: "ACTIVE",
      category: { name: "T-Shirts" },
      inventory: { quantity: 25 },
      images: [{ url: "/images/product1.jpg" }],
      createdAt: new Date().toISOString()
    }
  });
});

// Mock customer orders
app.get("/api/v1/orders", (req, res) => {
  res.json({
    success: true,
    data: {
      orders: [
        {
          id: "1",
          orderNumber: "ORD-001",
          status: "COMPLETED",
          total: 1299,
          createdAt: new Date().toISOString(),
          user: { name: "John Doe", email: "john@example.com" },
          payment: { status: "COMPLETED", method: "CREDIT_CARD" },
          items: [
            { name: "Premium T-Shirt", quantity: 2, price: 599 }
          ]
        }
      ]
    }
  });
});

app.get("/api/v1/orders/:id", (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      orderNumber: "ORD-001",
      status: "COMPLETED",
      total: 1299,
      createdAt: new Date().toISOString(),
      user: { name: "John Doe", email: "john@example.com" },
      payment: { status: "COMPLETED", method: "CREDIT_CARD" },
      items: [
        { name: "Premium T-Shirt", quantity: 2, price: 599 }
      ]
    }
  });
});

// Mock customer addresses and payment methods
app.get("/api/v1/customers/addresses", (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

app.get("/api/v1/customers/payment-methods", (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Mock auth endpoints
app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  if (email === "admin@ascension.com" && password === "admin123") {
    res.json({
      success: true,
      data: {
        token: "mock-jwt-token-admin",
        user: {
          id: "admin-1",
          name: "Admin User",
          email: "admin@ascension.com",
          role: "ADMIN"
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: "Invalid credentials"
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Admin API available at http://localhost:${PORT}/api/v1/admin`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/v1/auth/login`);
});

export default app;
