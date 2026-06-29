# Backend API Setup - NestJS & PostgreSQL

## ✅ Backend Architecture
The backend is built with **NestJS**, providing a highly modular and scalable structure. It uses **PostgreSQL** for relational data management and **TypeORM** for object-relational mapping.

---

## 📁 Core Modules
The system is organized into the following feature modules:

- **Auth**: JWT-based authentication, Google OAuth, and session management.
- **Tenant**: Multi-tenancy logic, store creation, and domain resolution.
- **Catalog**: Products, Categories (3-level hierarchy), and Attribute management.
- **Sales**: Orders, Invoices, and checkout processing.
- **Payments**: Integration with Razorpay and Stripe.
- **Subscriptions**: SaaS plans and merchant billing.
- **Cms**: Blog posts, custom pages, and sections.

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd api_nest
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `api_nest` directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ecommerce saas_nest
JWT_SECRET=your_jwt_secret
```

### 3. Database Sync
The project uses TypeORM with `synchronize: true` in development to automatically update the schema.
```bash
npm run start:dev
```

---

## 📡 Key API Features

### **Multi-tenancy**
Requests are intercepted by `TenantMiddleware` to identify the store. Use the `X-Tenant-Id` header or store domain for resolution.

### **Image Uploads**
Integrated with AWS S3 / Cloudinary for storing product and brand assets.

### **Authentication**
Use the `AuthGuard` on protected routes. Tokens are provided via `/auth/login`.

---

## 📋 Next Steps
1. **Migrations**: For production, disable `synchronize` and use TypeORM migrations.
2. **Postman**: Import `ecommerce saas-api.postman_collection.json` to test all endpoints.
3. **Admin Integration**: Connect the `admin` app to this API using the correct `baseUrl`.
