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

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for modern e-commerce**
