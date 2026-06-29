# Ecommerce SaaS - Software E-commerce SaaS Platform

Ecommerce SaaS is a full-stack monorepo project for a modern multi-tenant e-commerce platform dedicated to selling software products. It features a SaaS landing page, a global marketplace, individual tenant storefronts, and a powerful dual-role admin panel.

## Project Overview

This project is architected as a monorepo containing multiple distinct applications:

1.  **`landing` (SaaS Marketing):** The main entry point where users can learn about Ecommerce SaaS, view pricing plans, and register their own stores.
2.  **`marketplace` (Global Directory):** A hub for discovering all stores and products across the platform.
3.  **`web` (Tenant Storefront):** The individual storefront for each store, allowing customers to purchase products.
4.  **`admin` (Management Panel):** 
    *   **Super-Admin:** Platform-level management (Tenants, Plans, Global Settings).
    *   **Store-Admin:** Merchant-level management (Products, Orders, Customers).
5.  **`api_nest` (Backend Server):** The central NestJS API that handles all business logic, multi-tenancy, database interactions, and payments.

---

## Technology Stack

This project uses a modern TypeScript-based stack.

### Backend (`api_nest`)

- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL with TypeORM
- **Authentication:** Passport.js, JWT, bcryptjs
- **Validation:** Class-validator / DTOs
- **Language:** TypeScript

### Frontend Applications

- **Framework:** Next.js 15, React 19
- **UI Library:** Material-UI (Admin), Radix UI / shadcn (Web/Landing)
- **Styling:** Tailwind CSS v4
- **State Management:** Redux Toolkit / Context API
- **Language:** TypeScript

---

## Getting Started

### 1. Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- S3 Compatible Storage (Cloudinary/AWS)

### 2. Install Dependencies

Install dependencies for all packages:

```bash
# Backend
cd api_nest && npm install && cd ..

# Admin
cd admin && npm install && cd ..

# Web
cd web && npm install && cd ..

# Landing
cd landing && npm install && cd ..

# Marketplace
cd marketplace && npm install && cd ..
```

### 3. Environment Setup

Create `.env` in `api_nest`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ecommerce saas_nest
JWT_SECRET=your_secret
```

### 4. Run the Applications

**Backend:**
```bash
cd api_nest && npm run start:dev
```

**Frontend (Example Admin):**
```bash
cd admin && npm run dev
```

---     

## Project Structure

```
ecommerce saas/
├── api_nest/    # NestJS Backend
├── admin/       # Next.js Admin Panel
├── web/         # Next.js Storefront
├── marketplace/ # Next.js Marketplace
└── landing/     # Next.js Marketing
```

