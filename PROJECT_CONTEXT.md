

## 1. Project Overview
Ecommerce SaaS is a full-stack monorepo for a modern software e-commerce SaaS platform. It is designed to facilitate the sale of software products with a multi-tenant architecture, allowing multiple stores to operate under one platform.

The project consists of four main frontend applications and a centralized backend:
- **landing**: The marketing site for the SaaS platform itself.
- **marketplace**: A global directory for discovering stores and products.
- **web**: The customer-facing storefront for individual tenants.
- **admin**: A dual-purpose dashboard for both Super-Admins (platform) and Store-Admins (merchants).
- **api_nest**: The centralized NestJS backend server providing multi-tenant business logic.

## 2. Architecture & Structure
The project follows a monorepo structure with clear separation of concerns:

```
ecommerce saas/
├── api_nest/    # NestJS Backend (PostgreSQL)
├── admin/       # Next.js Admin Panel (Super & Store Admin)
├── web/         # Next.js Customer Storefront
├── marketplace/ # Next.js Global Marketplace
└── landing/     # Next.js Marketing Site
```

### Backend (`api_nest`)
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Architecture**: Modular (Modules -> Controllers -> Services -> Entities)
- **Multi-tenancy**: Handled via `TenantMiddleware` and `tenantId` segregation.
- **Authentication**: Passport.js with JWT and Google OAuth.
- **Payment**: Razorpay & Stripe integration.

### Frontends (Next.js 15)
- **Framework**: Next.js 15 (App Router)
- **UI Libraries**: 
  - **Admin**: Material-UI (MUI) v7
  - **Web/Landing**: Radix UI with Lucide Icons (shadcn/ui style)
- **Styling**: Tailwind CSS (v4)
- **State Management**: Redux Toolkit & Context API
- **Animations**: Framer Motion

## 3. Data Models & Hierarchy
The platform uses a hierarchical category structure:
1. **Category** (Top level)
2. **SubCategory** (Second level)
3. **ChildCategory** (Optional third level)

Tenants (Stores) are managed via the `Tenant` entity, and products are linked to specific tenants.

## 4. Development Workflow

### Running the Applications
Each application runs independently:

**API (Backend)**
```bash
cd api_nest
npm run start:dev # Runs on port 5000
```

**Admin Panel**
```bash
cd admin
npm run dev # Runs on port 3038 (custom start script)
```

**Web Storefront**
```bash
cd web
npm run dev # Runs on port 3000
```

## 5. Coding Standards & Guidelines

### General
- **Monorepo Structure**: Keep logic specific to each app.
- **TypeScript**: Mandatory for all packages.
- **Naming**: PascalCase for components/classes, camelCase for variables/functions.

### Backend
- **Modules**: Organize code into feature modules (Catalog, Sales, Auth, etc.).
- **DTOs**: Use Class-Validator and DTOs for request validation.

### Frontend
- **Styling**: Use Tailwind CSS v4.
- **Components**: Functional components with Hooks.
- **Animations**: Use Framer Motion for premium UI transitions.

## 6. Key Configuration Files
- **CLAUDE.md**: Specific guidelines for AI assistants.
- **api_nest/.env**: Environment variables for the backend (DB_HOST, JWT_SECRET, etc.).
- **architecture_report.html**: Visual architecture diagram (printable to PDF).

