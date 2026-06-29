# Authentication System: NestJS & PostgreSQL

## Overview
The Ecommerce SaaS platform uses a robust authentication system built into the NestJS backend, utilizing `Passport.js` and `JWT` (JSON Web Tokens). It supports multiple roles and multi-tenancy.

## Core Features
1. **Multi-Role Support**: Different access levels for Customers, Store Admins, and Super Admins.
2. **JWT Authentication**: Secure, stateless authentication via Bearer tokens.
3. **Google OAuth**: Social login integration.
4. **Email Verification**: Mandatory verification for new accounts.
5. **Password Security**: Bcrypt hashing for all passwords.

## Key Endpoints

### Public Routes
- `POST /auth/register`: Create a new user account.
- `POST /auth/login`: Authenticate and receive a JWT.
- `POST /auth/forgot-password`: Request a reset link.
- `GET /auth/verify-email/:token`: Verify email address.

### Protected Routes (Requires JWT)
- `GET /auth/me`: Get current user profile.
- `PATCH /auth/profile`: Update user information.
- `POST /auth/change-password`: Change password while logged in.

## Multi-tenancy Integration
Authentication is tenant-aware. When a user logs in, the system validates their relationship with the specific store (Tenant) they are accessing.

## Security Enhancements
- **Token Expiry**: Configurable JWT expiration.
- **Refresh Tokens**: (If implemented) Persistent sessions.
- **Account Blocking**: Ability for Super Admins to suspend accounts.
