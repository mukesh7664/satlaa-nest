# Email Service Setup: NestJS NotificationsModule

## Overview
Email functionality is centralized in the `NotificationsModule` within the `api_nest` backend. It uses `Nodemailer` to send beautifully styled HTML emails.

## Configuration
Add the following to your `api_nest/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@ecommerce saas.com
```

## Email Templates
Templates are managed within the backend services using inline CSS for maximum email client compatibility.
- **Welcome Email**: Sent after registration.
- **Email Verification**: Contains the link to verify the account.
- **Password Reset**: Contains the secure reset token.
- **Order Confirmation**: (In development) Sent after a successful purchase.

## Testing Locally
We recommend using **Mailtrap** for development. Update your `.env` with the SMTP credentials provided by your Mailtrap inbox.
