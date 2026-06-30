import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailTemplate } from '../admin/entities/email-template.entity';
import { EmailSettings } from '../admin/entities/email-settings.entity';
import { CryptoService } from '../common/crypto.service';
import { getFullS3Url } from '../common/utils/s3-url.util';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  // Global (fallback) transporter from env vars
  private globalTransporter: nodemailer.Transporter | null = null;
  private globalFromEmail: string;
  private globalFromName: string;
  private globalConfigured = false;

  constructor(
    private configService: ConfigService,
    @InjectRepository(EmailTemplate)
    private emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(EmailSettings)
    private emailSettingsRepository: Repository<EmailSettings>,
    private cryptoService: CryptoService,
  ) {
    this.globalFromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'EPxWEB';
    this.globalFromEmail = this.configService.get<string>('EMAIL_FROM_ADDRESS') || 'noreply@epxweb.com';
    this.initGlobalTransporter();
  }

  private initGlobalTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (host && user && pass) {
      this.globalTransporter = nodemailer.createTransport({
        host, port, secure: port === 465, auth: { user, pass },
      });
      this.globalConfigured = true;
      this.logger.log(`Global email transporter configured (${host}:${port})`);
    } else {
      this.logger.warn('Global SMTP not configured. Store-level SMTP or console logging will be used.');
    }
  }

  /** Get a transporter using the single EmailSettings row, or fallback to global */
  private async getTransporter(): Promise<{
    transporter: nodemailer.Transporter | null;
    from: string;
    configured: boolean;
  }> {
    const settings = await this.emailSettingsRepository.findOne({ where: {} });
    if (settings?.smtpHost && settings?.smtpUser && settings?.smtpPassword) {
      const port = settings.smtpPort || 587;
      const pass = this.cryptoService.decrypt(settings.smtpPassword);
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port,
        secure: port === 465,
        auth: { user: settings.smtpUser, pass },
      });
      const fromName = settings.fromName || 'Store';
      const fromEmail = settings.fromEmail || settings.smtpUser;
      return { transporter, from: `"${fromName}" <${fromEmail}>`, configured: true };
    }
    // Fallback to global env transporter
    return {
      transporter: this.globalTransporter,
      from: `"${this.globalFromName}" <${this.globalFromEmail}>`,
      configured: this.globalConfigured,
    };
  }

  /** Resolve a template by key */
  private async resolveTemplate(
    templateKey: string,
  ): Promise<EmailTemplate | null> {
    return this.emailTemplateRepository.findOne({
      where: { key: templateKey, isActive: true },
    });
  }

  /** Replace {{variable}} placeholders in a string with actual values */
  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
  }

  /**
   * Low-level send using configured SMTP + fallback to global.
   */
  async sendMail(
    to: string,
    subject: string,
    html: string,
    attachments?: any[],
  ): Promise<void> {
    const { transporter, from, configured } = await this.getTransporter();

    if (configured && transporter) {
      try {
        await transporter.sendMail({ from, to, subject, html, attachments });
        this.logger.log(`Email sent to ${to}: "${subject}"`);
      } catch (err) {
        this.logger.error(`Failed to send email to ${to}`, err);
      }
    } else {
      // Direct global SMTP send fallback in case configured is false but global transporter exists
      if (this.globalTransporter && this.globalConfigured) {
        try {
          const globalFrom = `"${this.globalFromName}" <${this.globalFromEmail}>`;
          await this.globalTransporter.sendMail({ from: globalFrom, to, subject, html, attachments });
          this.logger.log(`Email sent to ${to} via global SMTP: "${subject}"`);
          return;
        } catch (err) {
          this.logger.error(`Failed to send email via global SMTP to ${to}`, err);
        }
      }
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Attachments: ${attachments?.length || 0}`);
      this.logger.debug(`[MOCK EMAIL] Body:\n${html}`);
    }
  }

  async sendStoreSubscriptionInvoiceEmail(
    invoice: any,
    toEmail: string,
    ownerName: string,
    storeName: string,
    pdfBuffer?: Buffer,
  ): Promise<void> {
    const subject = `Invoice for Subscription Plan - ${invoice.plan?.name || 'Store Plan'} [${invoice.invoiceNumber}]`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">Subscription Invoice generated! 🎉</h2>
        <p>Dear ${ownerName},</p>
        <p>A new invoice has been generated for your store, <strong>${storeName}</strong>, regarding your platform subscription plan.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Invoice Number:</td>
            <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #E5E7EB;">${invoice.invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Plan:</td>
            <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #E5E7EB;">${invoice.plan?.name || 'SaaS Plan'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Billing Cycle:</td>
            <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #E5E7EB; text-transform: capitalize;">${invoice.billing_cycle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Amount:</td>
            <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #E5E7EB; font-weight: bold; color: #4F46E5;">${invoice.currency} ${Number(invoice.amount).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #E5E7EB;">Status:</td>
            <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #E5E7EB; text-transform: uppercase; color: green; font-weight: bold;">${invoice.status}</td>
          </tr>
        </table>
        <p>We have attached the PDF copy of your invoice to this email for your records.</p>
        <p>If you have any questions or require support, please reply to this email.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>The EPxWEB Team</strong></p>
      </div>
    `;

    const attachments = pdfBuffer ? [{
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }] : [];

    await this.sendMail(toEmail, subject, html, attachments);
  }

  // ─── Pre-built email methods ────────────────────────────────────────

  async sendWelcomeEmail(email: string, firstName: string) {
    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const storeName = this.globalFromName || 'our store';

    const template = await this.resolveTemplate('welcome');
    let subject: string;
    let html: string;

    if (template) {
      const vars: Record<string, string> = {
        fullName: firstName,
        email,
        shopLink: clientUrl,
        supportEmail: this.globalFromEmail,
        siteName: storeName,
        siteUrl: clientUrl,
        currentYear: new Date().getFullYear().toString(),
      };
      subject = this.interpolate(template.subject, vars);
      html = this.interpolate(template.htmlContent, vars);
    } else {
      subject = `Welcome to ${storeName}! 🎉`;
      html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4F46E5;">Welcome to ${storeName}, ${firstName}!</h2>
        <p>We're thrilled to have you on board.</p>
        <a href="${clientUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">Get Started</a>
      </div>`;
    }

    await this.sendMail(email, subject, html);
  }

  async sendOrderConfirmationEmail(order: any, store?: any) {
    const email = order.billingAddress?.email || order.shippingAddress?.email;
    const storeName = store?.name || 'EPxWEB';
    if (!email) {
      this.logger.warn(`No email found on order ${order.orderNumber}; skipping.`);
      return;
    }

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const template = await this.resolveTemplate('order_confirmation');
    let subject: string;
    let html: string;

    if (template) {
      const itemsList = (order.items || [])
        .map((i: any) => `${i.productTitle || i.productName || 'Item'} x${i.quantity} — ₹${Number(i.total).toFixed(2)}`)
        .join('<br>');
      const vars: Record<string, string> = {
        fullName: order.billingAddress?.fullName || 'Customer',
        orderNumber: order.orderNumber,
        date: new Date().toLocaleDateString('en-IN'),
        itemsList,
        subtotal: `₹${Number(order.subtotal || 0).toFixed(2)}`,
        discount: `₹${Number(order.discountAmount || 0).toFixed(2)}`,
        tax: `₹${Number(order.taxAmount || 0).toFixed(2)}`,
        shippingCost: `₹${Number(order.shippingCost || 0).toFixed(2)}`,
        total: `₹${Number(order.totalAmount).toFixed(2)}`,
        paymentMethod: order.paymentMethod || 'Online',
        deliveryAddress: [order.shippingAddress?.address, order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', '),
        trackingLink: `${clientUrl}/orders/${order.id}`,
        supportEmail: store?.supportEmail || this.globalFromEmail,
        siteName: storeName,
        siteUrl: store?.domain || clientUrl,
        currentYear: new Date().getFullYear().toString(),
      };
      subject = this.interpolate(template.subject, vars);
      html = this.interpolate(template.htmlContent, vars);
    } else {
      const itemsHtml = (order.items || [])
        .map((item: any) => `<tr><td>${item.productTitle || 'Item'}</td><td>${item.quantity}</td><td>₹${Number(item.total).toFixed(2)}</td></tr>`)
        .join('');
      subject = `${storeName} - Order Confirmation ${order.orderNumber}`;
      html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4F46E5;">Order Confirmed! 🎉</h2>
        <p>Order <strong>${order.orderNumber}</strong> from <strong>${storeName}</strong>.</p>
        <table><tbody>${itemsHtml}</tbody></table>
        <p><strong>Total: ₹${Number(order.totalAmount).toFixed(2)}</strong></p>
      </div>`;
    }

    await this.sendMail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, resetToken: string, store?: any) {
    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const storeName = store?.name || 'EPxWEB';
    const resetUrl = `${clientUrl}/auth/reset-password?token=${resetToken}`;

    const template = await this.resolveTemplate('reset_password');
    let subject: string;
    let html: string;

    if (template) {
      const vars: Record<string, string> = {
        fullName: 'Customer',
        email,
        resetLink: resetUrl,
        siteName: storeName,
        siteUrl: store?.domain || clientUrl,
        currentYear: new Date().getFullYear().toString(),
      };
      subject = this.interpolate(template.subject, vars);
      html = this.interpolate(template.htmlContent, vars);
    } else {
      subject = 'Reset Your Password';
      html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>Password Reset Request</h2>
        <p>Click below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
      </div>`;
    }

    await this.sendMail(email, subject, html);
  }

  /**
   * Send OTP email for admin forgot password (uses global/configured SMTP).
   */
  async sendOtpEmail(email: string, otp: string, name?: string): Promise<void> {
    const displayName = name || 'Admin';
    const subject = `${otp} is your EPxWEB verification code`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">Account Verification - EPxWEB</h2>
        <p>Dear ${displayName},</p>
        <p>We received a request to reset the password for your EPxWEB account associated with <strong>${email}</strong>.</p>
        <p>Please use the following verification code to proceed:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 20px; text-align: center; background: #F3F4F6; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; font-family: 'Courier New', monospace;">${otp}</span>
            </td>
          </tr>
        </table>
        <p style="font-size: 14px; color: #6B7280;">This code will expire in <strong>5 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
        <p>If you have any questions or require support, please reply to this email.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>The EPxWEB Team</strong></p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }

  async sendPasswordChangedEmail(email: string, firstName: string, store?: any) {
    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const storeName = store?.name || 'EPxWEB';
    const now = new Date();

    const template = await this.resolveTemplate('password_changed');
    let subject: string;
    let html: string;

    if (template) {
      const vars: Record<string, string> = {
        fullName: firstName,
        date: now.toLocaleDateString('en-IN'),
        time: now.toLocaleTimeString('en-IN'),
        resetLink: `${clientUrl}/auth/forgot-password`,
        supportEmail: store?.supportEmail || this.globalFromEmail,
        siteName: storeName,
        siteUrl: store?.domain || clientUrl,
        currentYear: now.getFullYear().toString(),
      };
      subject = this.interpolate(template.subject, vars);
      html = this.interpolate(template.htmlContent, vars);
    } else {
      subject = 'Your Password Has Been Changed';
      html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>Password Changed</h2>
        <p>Hi ${firstName}, your password was changed on ${now.toLocaleString()}.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      </div>`;
    }

    await this.sendMail(email, subject, html);
  }

  async sendVerificationEmail(email: string, verificationToken: string, store?: any) {
    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const storeName = store?.name || 'EPxWEB';
    const verificationUrl = `${clientUrl}/auth/verify-email?token=${verificationToken}`;

    const template = await this.resolveTemplate('verify_email');
    let subject: string;
    let html: string;

    if (template) {
      const vars: Record<string, string> = {
        fullName: 'Customer',
        verificationLink: verificationUrl,
        siteName: storeName,
        siteUrl: store?.domain || clientUrl,
        currentYear: new Date().getFullYear().toString(),
      };
      subject = this.interpolate(template.subject, vars);
      html = this.interpolate(template.htmlContent, vars);
    } else {
      subject = 'Verify Your Email Address';
      html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>Verify Your Email</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a>
      </div>`;
    }

    await this.sendMail(email, subject, html);
  }

  async sendEstimateEmail(estimate: any, store?: any) {
    const email = estimate.customer?.email;
    const storeName = store?.name || 'EPxWEB';
    if (!email) {
      this.logger.warn(`No email found for estimate ${estimate.estimateNumber}; skipping.`);
      return;
    }

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const estimateUrl = `${clientUrl}/estimates/${estimate.id}`;
    const template = await this.resolveTemplate('estimate_sent');
    let subject: string;
    let html: string;

    if (template) {
      const itemsList = (estimate.items || [])
        .map((i: any) => `${i.productName || 'Item'} x${i.quantity} — ₹${Number(i.price || 0).toFixed(2)}`)
        .join('<br>');
      const vars: Record<string, string> = {
        fullName: estimate.customer?.name || 'Customer',
        estimateNumber: estimate.estimateNumber,
        validUntil: estimate.validUntil ? new Date(estimate.validUntil).toLocaleDateString('en-IN') : 'N/A',
        itemsList,
        amount: `₹${Number(estimate.pricing?.total || 0).toFixed(2)}`,
        estimateLink: estimateUrl,
        downloadLink: getFullS3Url(estimate.pdfUrl) || estimateUrl,
        pdfUrl: getFullS3Url(estimate.pdfUrl) || estimateUrl,
        contactEmail: store?.supportEmail || this.globalFromEmail,
        siteName: storeName,
        siteUrl: store?.domain || clientUrl,
        currentYear: new Date().getFullYear().toString(),
      };
      subject = this.interpolate(template.subject, vars);
      html = this.interpolate(template.htmlContent, vars);
    } else {
      subject = `${storeName} - Estimate ${estimate.estimateNumber}`;
      html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>New Estimate: ${estimate.estimateNumber}</h2>
        <p>Hi ${estimate.customer?.name || 'Customer'},</p>
        <p>Please view your estimate at: <a href="${estimateUrl}">${estimateUrl}</a></p>
        ${estimate.pdfUrl ? `<p>Or download the PDF directly: <a href="${getFullS3Url(estimate.pdfUrl)}">Download PDF</a></p>` : ''}
      </div>`;
    }

    await this.sendMail(email, subject, html);
  }

  async sendInvoiceEmail(invoice: any, store?: any) {
    const email = invoice.customer?.email || invoice.billingAddress?.email;
    const storeName = store?.name || 'EPxWEB';
    if (!email) {
      this.logger.warn(`No email found for invoice ${invoice.invoiceNumber}; skipping.`);
      return;
    }

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const invoiceUrl = `${clientUrl}/invoices/${invoice.id}`;
    const template = await this.resolveTemplate('invoice_sent');
    let subject: string;
    let html: string;

    if (template) {
      const itemsList = (invoice.items || [])
        .map((i: any) => `${i.productName || 'Item'} x${i.quantity} — ₹${Number(i.total || 0).toFixed(2)}`)
        .join('<br>');
      const vars: Record<string, string> = {
        fullName: invoice.customer?.name || invoice.billingAddress?.fullName || 'Customer',
        invoiceNumber: invoice.invoiceNumber,
        orderNumber: invoice.orderNumber || '',
        date: invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
        itemsList,
        subtotal: `₹${Number(invoice.pricing?.subtotal || 0).toFixed(2)}`,
        tax: `₹${Number(invoice.pricing?.tax || 0).toFixed(2)}`,
        total: `₹${Number(invoice.pricing?.total || 0).toFixed(2)}`,
        invoiceLink: invoiceUrl,
        downloadLink: getFullS3Url(invoice.pdfUrl) || invoiceUrl,
        pdfUrl: getFullS3Url(invoice.pdfUrl) || invoiceUrl,
        siteName: storeName,
        siteUrl: store?.domain || clientUrl,
        currentYear: new Date().getFullYear().toString(),
      };
      subject = this.interpolate(template.subject, vars);
      html = this.interpolate(template.htmlContent, vars);
    } else {
      subject = `Invoice from ${storeName} #${invoice.invoiceNumber}`;
      html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>Invoice #${invoice.invoiceNumber}</h2>
        <p>Hello, please find your invoice at: <a href="${invoiceUrl}">${invoiceUrl}</a></p>
        ${invoice.pdfUrl ? `<p>Or download the PDF directly: <a href="${getFullS3Url(invoice.pdfUrl)}">Download PDF</a></p>` : ''}
        <p><strong>Total: ₹${Number(invoice.pricing?.total || 0).toFixed(2)}</strong></p>
      </div>`;
    }

    await this.sendMail(email, subject, html);
  }

  /**
   * Test SMTP settings by sending a test email without saving to DB.
   */
  async testConnection(settings: Partial<EmailSettings>, testEmail: string): Promise<void> {
    const host = settings.smtpHost;
    const port = settings.smtpPort || 587;
    const user = settings.smtpUser;
    // Decrypt if it looks like encrypted string, otherwise use as is (for unsaved UI changes)
    const pass = this.cryptoService.decrypt(settings.smtpPassword || '');

    if (!host || !user || !pass) {
      throw new Error('Incomplete SMTP settings');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const fromName = settings.fromName || 'Test Sender';
    const fromEmail = settings.fromEmail || user;
    const from = `"${fromName}" <${fromEmail}>`;

    try {
      await transporter.sendMail({
        from,
        to: testEmail,
        subject: 'SMTP Connection Test',
        html: `<h3>SMTP Connection Test Successful!</h3><p>This is a test email sent from your new SMTP configuration.</p>`,
      });
      this.logger.log(`SMTP Test successful for ${host}:${port} to ${testEmail}`);
    } catch (err) {
      this.logger.error(`SMTP Test failed for ${host}:${port}`, err);
      throw err;
    }
  }

  /**
   * Send a test email using a specific template.
   */
  async sendTemplateTestEmail(templateId: string, targetEmail: string): Promise<void> {
    const template = await this.emailTemplateRepository.findOne({ where: { id: templateId } });
    if (!template) {
      throw new Error('Template not found');
    }

    const siteName = this.globalFromName || 'EPxWEB Test';

    // Use dummy variables for test
    const vars: Record<string, string> = {
      fullName: 'Test User',
      email: targetEmail,
      currentYear: new Date().getFullYear().toString(),
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN'),
      siteName,
    };

    const subject = this.interpolate(template.subject, vars);
    const html = this.interpolate(template.htmlContent, vars);

    await this.sendMail(targetEmail, subject, html);
  }
}
