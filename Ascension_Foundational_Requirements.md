# Ascension E-Commerce Platform — Foundational Requirements
> Derived from SRS v3.0 | Ready for Antigravity refinement

---

## 1. Project Overview

**Brand:** Ascension — a premium direct-to-consumer athleisure brand.
**Products:** T-shirts and joggers.
**Goal:** A full-stack e-commerce web application with a minimalist, high-performance storefront, secure checkout, user portal, and admin backend.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React) + Tailwind CSS |
| Animations | Framer Motion only — **no Three.js or 3D libraries** |
| Backend | Node.js + Express **or** Java + Spring Boot |
| Database | PostgreSQL (preferred) or MongoDB |
| Auth | NextAuth.js or Supabase Auth |
| Payments | Razorpay (domestic) + Stripe (international) |
| Email | SendGrid / Resend / AWS SES |
| SMS | Twilio or MSG91 |

---

## 3. Brand & Design System

- **Background:** Pure White `#FFFFFF`
- **Typography:** Deep Black `#000000`, clean modern sans-serif
- **CTA Buttons:** Black `#000000` background, white text
- **Secondary / Borders:** Cool Grays `#EFEFEF`, `#CCCCCC`
- **Hover / Active Accents:** Clear Blue `#2196F3`
- **Hero Image:** Diverse model lineup on white background showcasing t-shirt front & back, with "ASCENSION" centered behind them
- **Philosophy:** Minimalist, premium, mobile-first

---

## 4. Core Pages & Features

### 4.1 Homepage
- Animated hero section — smooth text reveals via Framer Motion
- Staggered product grid fade-in on load
- Brand trust elements in footer (Udyam Registration Number, trademark ™/® indicators)

### 4.2 Product Catalog
- Grid layout for t-shirts and joggers
- Real-time filtering: category, size, color
- Sorting: price (asc/desc), newest

### 4.3 Product Detail Page (PDP)
- High-resolution image gallery
- Zoom-on-hover effect
- Size guide
- Dynamic stock availability indicator ("In Stock" / "Out of Stock")

### 4.4 Shopping Cart
- Slide-out drawer (or dedicated page)
- Update quantity, remove items
- Cost breakdown: subtotal, shipping, calculated tax

### 4.5 Authentication & Checkout
- Guest users are **intercepted** at checkout and redirected to Sign Up / Login
- Multi-step checkout flow: **Shipping → Billing → Payment → Confirmation**
- Progress indicator on each step
- Payments via Razorpay (UPI, net banking, domestic cards) and Stripe (international)

### 4.6 User Profile Dashboard
- Edit personal details and change password
- Address book management (multiple addresses, billing/shipping types)
- Order history with detailed fulfillment and tracking status

---

## 5. Header

- **Header Layout:** Logo on the left, navigation menu in the center, and shopping cart and wishlist icons on the right.
- **Shopping Cart Icon:** Display the number of items in the cart.
- **Wishlist Icon:** Display the number of items in the wishlist.

---

## 6. Shopping Cart and Wishlist Requirements

- **Shopping Cart:**
  - Display the total number of items in the cart.
  - Display the total cost of items in the cart.
  - Allow users to view cart contents and edit quantities.
  - Allow users to remove items from the cart.
- **Wishlist:**
  - Display the total number of items in the wishlist.
  - Allow users to view wishlist contents and add items to cart.
  - Allow users to remove items from the wishlist.

---

## 7. Admin Panel

- Separate, secured login portal for admin staff only
- **Inventory Management:** Full CRUD for products; auto-sets "Out of Stock" when quantity reaches zero
- **Order Processing:** View all orders, update fulfillment status (Pending / Shipped / Delivered), input tracking numbers
- **Marketing Interface:** Trigger promotional email blasts and SMS campaigns to registered users

---

## 8. Automated Messaging

These are triggered automatically by system events:
- Order confirmation (email + SMS)
- Shipping update with tracking number (email + SMS)
- Password reset link (email)

---

## 9. Business & Compliance Rules

- **GST Tax Engine:** Dynamically calculate CGST, SGST, or IGST based on the customer's shipping state at checkout
- **PDF Invoice Generation:** Auto-generated on payment confirmation, must include: itemized products, tax breakdown, business registered address, and GSTIN
- **Legal Identifiers:** Footer and About Us page must display Udyam Registration Number and brand trademark status

---

## 10. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Google Lighthouse mobile score ≥ 85; images lazy-loaded and optimized |
| Responsiveness | Mobile-first; supports 320px → 4K displays |
| Security | Passwords hashed with bcrypt; HTTPS enforced; payment data tokenized (never stored on server) |
| Cart Persistence | Guest carts → localStorage; logged-in carts → synced to database |

---

## 11. Database Schema

### Users
`id, name, email, password_hash, phone, role (admin/customer), created_at`

### Products
`id, sku, name, description, category, base_price, stock_quantity, image_urls[]`

### Cart
`id, user_id OR session_id, updated_at`

### CartItem
`id, cart_id (FK), product_id (FK), quantity`

### Address
`id, user_id (FK), street, city, state, postal_code, country, address_type (billing/shipping)`

### Order
`id, user_id (FK), subtotal, tax_amount, shipping_cost, total_amount, fulfillment_status, payment_status, tracking_number, created_at`

### OrderItem
`id, order_id (FK), product_id (FK), quantity, price_at_purchase`

---

## 12. Key Constraints & Decisions

1. **No 3D rendering** — Framer Motion is the only animation library allowed
2. **Authentication is mandatory for checkout** — no guest payment processing
3. **Payment data must never be stored** on Ascension's servers — tokenization via gateway only
4. **GST compliance is non-negotiable** — tax calculation must be server-side, pre-order
5. **PostgreSQL is the preferred database** — use MongoDB only if relational constraints are impractical
