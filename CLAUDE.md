# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ecommerce SaaS is a full-stack monorepo for a software e-commerce SaaS platform:
- **api_nest**: NestJS backend with PostgreSQL (TypeORM)
- **admin**: Next.js 15 admin panel (Super & Store Admin)
- **web**: Next.js 15 customer storefront
- **marketplace**: Next.js global store directory
- **landing**: Next.js SaaS marketing site

## Development Commands

### API (Backend)
```bash
cd api_nest
npm run start:dev   # Start NestJS in watch mode
npm run build       # Compile to dist/
npm run start:prod  # Run compiled build
npm run test        # Run Jest tests
```

### Frontend Applications (admin, web, marketplace, landing)
```bash
cd [app-name]
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

## Architecture & Code Organization

### API Structure (NestJS)

The backend follows a **modular architecture**:

**Modules** (`src/[module-name]/`) - Encapsulate related controllers, services, and entities.
**Controllers** - Handle HTTP requests/responses.
**Services** - Contain business logic.
**Entities** - TypeORM database models.
**Middleware** - `TenantMiddleware` for multi-tenancy.

#### Multi-tenancy
The system uses a `TenantMiddleware` to identify the current store based on headers or domain. Ensure all data queries are filtered by `tenantId` where applicable.

### Frontend Architecture

All apps use:
- **Next.js 15 App Router**
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** for animations

#### Admin Panel organization:
- `src/app/(super-admin)` - Platform owner routes.
- `src/app/(store-admin)` - Merchant dashboard routes.

## Coding Standards

### Backend
- Use NestJS dependency injection.
- Create DTOs for request validation using `class-validator`.
- Use TypeORM repositories for database access.
- Follow the `async/await` pattern.

### Frontend
- Use Tailwind CSS v4 exclusively.
- Use functional components and React hooks.
- PascalCase for component filenames.

## Database Connection
PostgreSQL connection is managed in `api_nest/src/app.module.ts` via `TypeOrmModule`. Environment variables like `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DATABASE` are required.
