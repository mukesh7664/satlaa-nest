# Gemini Assistant Guidelines for the Ecommerce SaaS Project

## General
- **Language:** TypeScript is mandatory for all packages.
- **Monorepo Structure:** 
    - `api_nest`: NestJS backend.
    - `admin`: Next.js admin dashboard.
    - `web`: Next.js client storefront.
    - `marketplace`: Next.js global directory.
    - `landing`: Next.js marketing site.

---

## Backend (`api_nest`)
- **Architecture:** NestJS Modular Architecture.
- **Data Access:** Use TypeORM with PostgreSQL.
- **Validation:** Use DTOs and `class-validator`.
- **Multi-tenancy:** Always consider the `tenantId` in queries and logic.
- **Error Handling:** Use NestJS `HttpException` and built-in filters.

---

## Frontend
- **Framework:** Next.js 15 (App Router).
- **Styling:** Tailwind CSS v4.
- **Components:** Functional components with React Hooks.
- **UI Libraries:** 
    - `admin`: MUI v7.
    - `web/landing/marketplace`: Radix UI / shadcn style.
- **Animations:** Framer Motion for high-end UI feel.

