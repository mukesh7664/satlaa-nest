export const DEFAULT_EMAIL_TEMPLATES = [
    {
        key: 'admin_reset_password',
        name: 'Admin Password Reset',
        subject: 'Reset Your Admin Password',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Admin Password Reset</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#1a1a2e;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
      </td></tr>
      <tr><td style="padding:40px 30px;">
        <h2 style="color:#333;margin-top:0;">Admin Password Reset</h2>
        <p style="color:#555;line-height:1.6;">Hello <strong>{{adminName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">We received a request to reset the password for your admin account. Click the button below to reset it.</p>
        <p style="text-align:center;margin:30px 0;">
          <a href="{{resetLink}}" style="background:#1a1a2e;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">Reset Admin Password</a>
        </p>
        <p style="color:#999;font-size:13px;">This link will expire in <strong>1 hour</strong>. If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        <p style="color:#999;font-size:13px;">If the button doesn't work, copy and paste this link:<br><a href="{{resetLink}}" style="color:#1a1a2e;">{{resetLink}}</a></p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['adminName', 'resetLink', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'bank_transfer_invoice',
        name: 'Bank Transfer Invoice',
        subject: 'Invoice & Payment Details - {{orderNumber}}',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Bank Transfer Invoice</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#2d6a4f;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
        <p style="color:#d8f3dc;margin:5px 0 0 0;">Invoice & Bank Transfer Details</p>
      </td></tr>
      <tr><td style="padding:40px 30px;">
        <p style="color:#555;line-height:1.6;">Dear <strong>{{fullName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">Thank you for your order. Please complete your payment via bank transfer using the details below.</p>
        <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin:20px 0;">
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Order Number</td>
              <td style="color:#555;border-bottom:1px solid #eee;">{{orderNumber}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Amount Due</td>
              <td style="color:#2d6a4f;font-weight:bold;font-size:18px;border-bottom:1px solid #eee;">{{amount}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;">Items</td>
              <td style="color:#555;">{{itemsList}}</td></tr>
        </table>
        <h3 style="color:#333;border-bottom:2px solid #2d6a4f;padding-bottom:8px;">Bank Transfer Details</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #eee;border-radius:6px;">
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;width:40%;">Bank Name</td>
              <td style="color:#555;">{{bankName}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;">Account Name</td>
              <td style="color:#555;">{{accountName}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;">Account Number</td>
              <td style="color:#555;">{{accountNumber}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;">IFSC Code</td>
              <td style="color:#555;">{{ifscCode}}</td></tr>
        </table>
        <p style="color:#555;line-height:1.6;margin-top:20px;">Please use <strong>{{orderNumber}}</strong> as the payment reference. Once payment is confirmed, we will process your order immediately.</p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['fullName', 'orderNumber', 'amount', 'itemsList', 'bankName', 'accountName', 'accountNumber', 'ifscCode', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'cod_order_placed',
        name: 'COD Order Placed',
        subject: 'Order Placed - {{orderNumber}} (Cash on Delivery)',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>COD Order Placed</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#e76f51;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
        <p style="color:#fdebd0;margin:5px 0 0 0;">Order Confirmed!</p>
      </td></tr>
      <tr><td style="padding:40px 30px;">
        <h2 style="color:#333;margin-top:0;">🎉 Your Order is Confirmed!</h2>
        <p style="color:#555;line-height:1.6;">Hi <strong>{{fullName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">Thank you for your order! We've received it and it's being prepared. You'll pay <strong>Cash on Delivery</strong> when your order arrives.</p>
        <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin:20px 0;">
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Order Number</td>
              <td style="color:#e76f51;font-weight:bold;">{{orderNumber}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Order Date</td>
              <td style="color:#555;">{{date}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Items</td>
              <td style="color:#555;">{{itemsList}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Total to Pay (COD)</td>
              <td style="color:#333;font-weight:bold;font-size:18px;">{{total}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;">Delivery Address</td>
              <td style="color:#555;">{{deliveryAddress}}</td></tr>
        </table>
        <p style="color:#555;line-height:1.6;">Your order will be delivered within <strong>{{estimatedDelivery}}</strong>. Please keep the exact cash amount ready.</p>
        <p style="text-align:center;margin:30px 0;">
          <a href="{{trackingLink}}" style="background:#e76f51;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">Track Your Order</a>
        </p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['fullName', 'orderNumber', 'date', 'itemsList', 'total', 'deliveryAddress', 'estimatedDelivery', 'trackingLink', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'reset_password',
        name: 'Customer Password Reset',
        subject: 'Reset Your Password',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Reset Password</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#4a4e69;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
        <p style="color:#c9cde0;margin:5px 0 0 0;">Password Reset Request</p>
      </td></tr>
      <tr><td style="padding:40px 30px;">
        <h2 style="color:#333;margin-top:0;">Reset Your Password</h2>
        <p style="color:#555;line-height:1.6;">Hello <strong>{{fullName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">We received a request to reset the password for your account associated with <strong>{{email}}</strong>. Click the button below to reset it.</p>
        <p style="text-align:center;margin:30px 0;">
          <a href="{{resetLink}}" style="background:#4a4e69;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">Reset Password</a>
        </p>
        <p style="color:#999;font-size:13px;">This link will expire in <strong>24 hours</strong>. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p style="color:#999;font-size:13px;">Or copy and paste this URL:<br><a href="{{resetLink}}" style="color:#4a4e69;">{{resetLink}}</a></p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['fullName', 'email', 'resetLink', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'email_verified',
        name: 'Email Verified Confirmation',
        subject: 'Email Verified Successfully! 🎉',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Email Verified</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#06d6a0;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
      </td></tr>
      <tr><td style="padding:40px 30px;text-align:center;">
        <div style="width:70px;height:70px;background:#06d6a0;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:36px;line-height:70px;">✓</div>
        <h2 style="color:#333;margin-top:0;">Email Verified Successfully!</h2>
        <p style="color:#555;line-height:1.6;">Hi <strong>{{fullName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">Great news! Your email address <strong>{{email}}</strong> has been successfully verified. Your account is now active and you can start shopping.</p>
        <p style="margin:30px 0;">
          <a href="{{loginLink}}" style="background:#06d6a0;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">Go to My Account</a>
        </p>
        <p style="color:#555;line-height:1.6;">If you have any questions, feel free to contact our support team at <a href="mailto:{{supportEmail}}" style="color:#06d6a0;">{{supportEmail}}</a>.</p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['fullName', 'email', 'loginLink', 'supportEmail', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'estimate_sent',
        name: 'Estimate Sent',
        subject: 'Estimate {{estimateNumber}} from {{siteName}}',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Estimate</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#457b9d;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
        <p style="color:#a8dadc;margin:5px 0 0 0;">Estimate #{{estimateNumber}}</p>
      </td></tr>
      <tr><td style="padding:40px 30px;">
        <p style="color:#555;line-height:1.6;">Dear <strong>{{fullName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">Please find below the estimate for your inquiry. This estimate is valid until <strong>{{validUntil}}</strong>.</p>
        <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin:20px 0;">
          <tr style="background:#f9f9f9;"><th style="text-align:left;color:#333;border-bottom:1px solid #eee;">Item</th><th style="text-align:right;color:#333;border-bottom:1px solid #eee;">Qty</th><th style="text-align:right;color:#333;border-bottom:1px solid #eee;">Amount</th></tr>
          <tr><td colspan="3" style="color:#555;">{{itemsList}}</td></tr>
          <tr style="background:#f9f9f9;"><td colspan="2" style="font-weight:bold;color:#333;border-top:2px solid #eee;">Total</td><td style="text-align:right;font-weight:bold;color:#457b9d;font-size:18px;border-top:2px solid #eee;">{{amount}}</td></tr>
        </table>
        <p style="text-align:center;margin:30px 0;">
          <a href="{{estimateLink}}" style="background:#457b9d;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">View Full Estimate</a>
        </p>
        <p style="color:#555;line-height:1.6;">To accept this estimate or if you have any questions, please contact us at <a href="mailto:{{contactEmail}}" style="color:#457b9d;">{{contactEmail}}</a>.</p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['fullName', 'estimateNumber', 'validUntil', 'itemsList', 'amount', 'estimateLink', 'contactEmail', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'default_template',
        name: 'General Email Template',
        subject: '{{subject}}',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>{{subject}}</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#333;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
      </td></tr>
      <tr><td style="padding:40px 30px;">
        <h2 style="color:#333;margin-top:0;">{{title}}</h2>
        <div style="color:#555;line-height:1.8;">{{message}}</div>
        <p style="text-align:center;margin:30px 0;">
          <a href="{{ctaLink}}" style="background:#333;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">{{ctaText}}</a>
        </p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['subject', 'title', 'message', 'ctaLink', 'ctaText', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'invoice_sent',
        name: 'Invoice Sent',
        subject: 'Invoice from {{siteName}} #{{invoiceNumber}}',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Invoice</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#2b2d42;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
        <p style="color:#8d99ae;margin:5px 0 0 0;">Invoice #{{invoiceNumber}}</p>
      </td></tr>
      <tr><td style="padding:40px 30px;">
        <p style="color:#555;line-height:1.6;">Dear <strong>{{fullName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">Please find your invoice for order <strong>{{orderNumber}}</strong> below.</p>
        <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin:20px 0;">
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;width:50%;">Invoice Number</td>
              <td style="color:#555;border-bottom:1px solid #eee;">#{{invoiceNumber}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Order Number</td>
              <td style="color:#555;border-bottom:1px solid #eee;">{{orderNumber}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Invoice Date</td>
              <td style="color:#555;border-bottom:1px solid #eee;">{{date}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Items</td>
              <td style="color:#555;border-bottom:1px solid #eee;">{{itemsList}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Subtotal</td>
              <td style="color:#555;border-bottom:1px solid #eee;">{{subtotal}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Tax</td>
              <td style="color:#555;border-bottom:1px solid #eee;">{{tax}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;">Total</td>
              <td style="color:#2b2d42;font-weight:bold;font-size:18px;">{{total}}</td></tr>
        </table>
        <p style="text-align:center;margin:30px 0;">
          <a href="{{invoiceLink}}" style="background:#2b2d42;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">Download Invoice</a>
        </p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['fullName', 'invoiceNumber', 'orderNumber', 'date', 'itemsList', 'subtotal', 'tax', 'total', 'invoiceLink', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'order_confirmation',
        name: 'Order Confirmation',
        subject: 'Order Confirmation - {{orderNumber}}',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Confirmation</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#264653;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
        <p style="color:#a8dadc;margin:5px 0 0 0;">Order Confirmed!</p>
      </td></tr>
      <tr><td style="padding:40px 30px;">
        <h2 style="color:#333;margin-top:0;">🎉 Thank you for your order!</h2>
        <p style="color:#555;line-height:1.6;">Hi <strong>{{fullName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">We've received your order and it's now being processed. You'll receive another email once your order ships.</p>
        <table width="100%" cellpadding="10" cellspacing="0" style="border:1px solid #eee;border-radius:6px;margin:20px 0;">
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Order Number</td>
              <td style="color:#264653;font-weight:bold;">{{orderNumber}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Order Date</td>
              <td style="color:#555;">{{date}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Items Ordered</td>
              <td style="color:#555;">{{itemsList}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Subtotal</td>
              <td style="color:#555;">{{subtotal}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Shipping</td>
              <td style="color:#555;">{{shippingCost}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Total</td>
              <td style="color:#264653;font-weight:bold;font-size:18px;">{{total}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;border-bottom:1px solid #eee;">Payment Method</td>
              <td style="color:#555;">{{paymentMethod}}</td></tr>
          <tr><td style="font-weight:bold;color:#333;background:#f9f9f9;">Delivery Address</td>
              <td style="color:#555;">{{deliveryAddress}}</td></tr>
        </table>
        <p style="text-align:center;margin:30px 0;">
          <a href="{{trackingLink}}" style="background:#264653;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">Track Your Order</a>
        </p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">Need help? Contact us at <a href="mailto:{{supportEmail}}" style="color:#264653;">{{supportEmail}}</a></p>
        <p style="color:#aaa;font-size:12px;margin:5px 0 0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['fullName', 'orderNumber', 'date', 'itemsList', 'subtotal', 'shippingCost', 'total', 'paymentMethod', 'deliveryAddress', 'trackingLink', 'supportEmail', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'password_changed',
        name: 'Password Changed Notification',
        subject: 'Your Password Has Been Changed',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Password Changed</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#e63946;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
        <p style="color:#ffd6d6;margin:5px 0 0 0;">Security Alert</p>
      </td></tr>
      <tr><td style="padding:40px 30px;">
        <h2 style="color:#333;margin-top:0;">⚠️ Password Changed</h2>
        <p style="color:#555;line-height:1.6;">Hi <strong>{{fullName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">Your account password has been successfully changed on <strong>{{date}}</strong> at <strong>{{time}}</strong>.</p>
        <div style="background:#fff3f3;border-left:4px solid #e63946;padding:15px;margin:20px 0;border-radius:4px;">
          <p style="color:#e63946;margin:0;font-weight:bold;">If you did not make this change, your account may be compromised.</p>
          <p style="color:#555;margin:8px 0 0 0;">Please contact our support team immediately at <a href="mailto:{{supportEmail}}" style="color:#e63946;">{{supportEmail}}</a> or reset your password immediately.</p>
        </div>
        <p style="text-align:center;margin:30px 0;">
          <a href="{{resetLink}}" style="background:#e63946;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">Reset Password Now</a>
        </p>
        <p style="color:#999;font-size:13px;">If you made this change, no further action is needed. This is just a confirmation email for your security.</p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['fullName', 'date', 'time', 'resetLink', 'supportEmail', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'verify_email',
        name: 'Verify Email Address',
        subject: 'Verify Your Email Address',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verify Email</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:#3a86ff;padding:30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{{siteName}}</h1>
        <p style="color:#cce0ff;margin:5px 0 0 0;">Email Verification</p>
      </td></tr>
      <tr><td style="padding:40px 30px;text-align:center;">
        <h2 style="color:#333;margin-top:0;">Please Verify Your Email</h2>
        <p style="color:#555;line-height:1.6;">Hi <strong>{{fullName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">Thanks for signing up at <strong>{{siteName}}</strong>! Please verify your email address to complete your registration and start shopping.</p>
        <p style="margin:30px 0;">
          <a href="{{verificationLink}}" style="background:#3a86ff;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">Verify My Email</a>
        </p>
        <p style="color:#999;font-size:13px;">This link expires in <strong>24 hours</strong>. If you didn't create an account, please ignore this email.</p>
        <p style="color:#999;font-size:13px;">Or copy and paste this URL:<br><a href="{{verificationLink}}" style="color:#3a86ff;">{{verificationLink}}</a></p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['fullName', 'verificationLink', 'siteName', 'siteUrl', 'currentYear']
    },
    {
        key: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to {{siteName}}! 🚀',
        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td>
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 30px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;">Welcome to {{siteName}}!</h1>
        <p style="color:#e0d7ff;margin:10px 0 0 0;font-size:16px;">We're thrilled to have you on board 🎉</p>
      </td></tr>
      <tr><td style="padding:40px 30px;">
        <p style="color:#555;line-height:1.6;font-size:16px;">Hi <strong>{{fullName}}</strong>,</p>
        <p style="color:#555;line-height:1.6;">Your account has been successfully created. You can now explore all our products and enjoy a seamless shopping experience.</p>
        <div style="background:#f8f7ff;border-radius:8px;padding:20px;margin:25px 0;">
          <h3 style="color:#667eea;margin-top:0;">Your Account Details</h3>
          <p style="margin:0;color:#555;"><strong>Name:</strong> {{fullName}}</p>
          <p style="margin:5px 0 0;color:#555;"><strong>Email:</strong> {{email}}</p>
        </div>
        <h3 style="color:#333;margin-top:25px;">What's next?</h3>
        <ul style="color:#555;line-height:2;">
          <li>Browse our latest products and collections</li>
          <li>Set up your delivery address for faster checkout</li>
          <li>Explore exclusive deals and offers</li>
        </ul>
        <p style="text-align:center;margin:30px 0;">
          <a href="{{shopLink}}" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:16px;display:inline-block;">Start Shopping</a>
        </p>
        <p style="color:#555;line-height:1.6;">If you have any questions, our support team is always here to help at <a href="mailto:{{supportEmail}}" style="color:#667eea;">{{supportEmail}}</a>.</p>
        <p style="color:#555;line-height:1.6;">Happy Shopping! 🛍️<br><strong>The {{siteName}} Team</strong></p>
      </td></tr>
      <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#aaa;font-size:12px;margin:0;">{{siteName}} &bull; {{siteUrl}} &bull; {{currentYear}}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
        variables: ['fullName', 'email', 'shopLink', 'supportEmail', 'siteName', 'siteUrl', 'currentYear']
    }
];
