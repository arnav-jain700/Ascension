# Ascension E-commerce Platform

A modern, full-stack e-commerce platform built with Next.js, TypeScript, and Express.js.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+
- PostgreSQL (or use Docker)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Backend environment
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env with your database and API keys
   ```

3. **Set up database**
   ```bash
   # Start PostgreSQL (if using Docker)
   npm run db:up
   
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # (Optional) Seed database with sample data
   npm run db:seed
   ```

### Development

#### **Start Both Frontend & Backend Simultaneously**
```bash
npm run dev:full
```
This starts:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

#### **Start Services Individually**
```bash
# Frontend only
npm run dev:frontend

# Backend only  
npm run dev:backend

# All services (using Turbo)
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:full` | Start frontend & backend together |
| `npm run dev:frontend` | Start Next.js frontend only |
| `npm run dev:backend` | Start Express backend only |
| `npm run dev` | Start all services with Turbo |
| `npm run build` | Build all packages |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **Port**: 3000

### Backend (Express.js)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Port**: 5000

### Features
- ✅ User authentication & registration
- ✅ Product catalog with variants
- ✅ Shopping cart & checkout
- ✅ Order management
- ✅ Admin dashboard
- ✅ Payment integration (Razorpay/Stripe ready)
- ✅ File upload system
- ✅ Analytics & reporting

## 🔐 Admin Access

### Login Credentials
- **URL**: http://localhost:3000/admin/login
- **Email**: admin@ascension.com
- **Password**: admin123

### Admin Features
- 📊 Dashboard with business metrics
- 📦 Product management
- 📋 Order processing
- 👥 Customer management
- 📈 Analytics & reports
- ⚙️ Business settings

## 🛠️ Development

### Project Structure
```
ascension/
├── apps/
│   ├── web/           # Next.js frontend
│   └── backend/       # Express.js backend
├── packages/          # Shared packages
├── prisma/           # Database schema
└── README.md
```

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ascension_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Payment Gateways
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
STRIPE_SECRET_KEY="sk_test_your_key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Database Management
```bash
# View database in browser
npm run db:studio

# Reset database
npm run db:push --force-reset

# Create new migration
npm run db:migrate
```

## 📱 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Products
- `GET /api/v1/products` - List products
- `GET /api/v1/products/:slug` - Get single product
- `POST /api/v1/products` - Create product (admin)

### Orders
- `GET /api/v1/orders` - Get user orders
- `POST /api/v1/orders` - Create order
- `PUT /api/v1/orders/:id/status` - Update status (admin)

### Admin
- `GET /api/v1/admin/dashboard` - Dashboard stats
- `GET /api/v1/admin/orders` - All orders
- `GET /api/v1/admin/customers` - Customer list
- `GET /api/v1/admin/analytics` - Business analytics

## 🚀 Deployment

### Production Build
```bash
# Build all packages
npm run build

# Start production servers
npm run start
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set up SSL certificates
- Configure payment gateways

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for modern e-commerce**
