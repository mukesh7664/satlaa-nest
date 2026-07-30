import { Injectable } from '@nestjs/common';
const PDFDocument = require('pdfkit');
import { Invoice } from './entities/invoice.entity';
import { Estimate } from './entities/estimate.entity';
import { GeneralSettings } from '../admin/entities/general-settings.entity';

@Injectable()
export class PdfService {
    async generateInvoicePdf(invoice: Invoice, settings: GeneralSettings): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Header - Store Info from Settings
            if (settings) {
                doc.fillColor('#444444')
                    .fontSize(20)
                    .text(settings.siteName || 'Invoice', 50, 50);
                
                doc.fontSize(10)
                    .text(settings.address || '', 50, 80)
                    .text(settings.contactPhone || '', 50, 95)
                    .text(settings.contactEmail || '', 50, 110);
                
                if (settings.taxSettings?.gstin) {
                    doc.text(`GSTIN: ${settings.taxSettings.gstin}`, 50, 125);
                }
            } else {
                doc.fillColor('#444444')
                    .fontSize(20)
                    .text('Invoice', 50, 50);
            }

            doc.fillColor('#444444')
                .fontSize(20)
                .text('INVOICE', 50, 160, { align: 'right' });

            this.generateHr(doc, 185);

            // Invoice Details
            const customer = invoice.customer || {};
            const customerName = customer.name || (customer.firstName ? (customer.firstName + ' ' + (customer.lastName || '')) : 'Customer');
            
            doc.fontSize(10)
               .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 200)
               .text(`Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 50, 215)
               .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 230)
               .text('Bill To:', 300, 200)
               .text(customerName, 300, 215)
               .text(customer.address || '', 300, 230)
               .text(`${customer.city || ''}, ${customer.state || ''} ${customer.zipCode || ''}`, 300, 245);

            this.generateHr(doc, 270);

            // Item Table
            let invoiceTableTop = 330;
            doc.fontSize(10);
            this.generateTableRow(doc, invoiceTableTop, 'Item', 'HSN', 'Qty', 'Price', 'Tax %', 'Tax Amt', 'Total');
            this.generateHr(doc, invoiceTableTop + 20);

            const items = invoice.items || [];
            items.forEach((item, i) => {
                const position = invoiceTableTop + (i + 1) * 30;
                this.generateTableRow(
                    doc,
                    position,
                    item.productName || 'Product',
                    item.hsn_code || '-',
                    item.quantity.toString(),
                    `${item.price}`,
                    `${item.tax_rate || 0}%`,
                    `${item.tax_amount || 0}`,
                    `${item.total}`
                );
                this.generateHr(doc, position + 20);
            });

            // Totals
            const subtotalPosition = invoiceTableTop + (items.length + 1) * 30 + 20;
            doc.fontSize(10)
               .text('Subtotal:', 380, subtotalPosition)
               .text(`${invoice.pricing.currency} ${invoice.pricing.subtotal}`, 0, subtotalPosition, { align: 'right' })
               .text('Tax:', 380, subtotalPosition + 20)
               .text(`${invoice.pricing.currency} ${invoice.pricing.tax}`, 0, subtotalPosition + 20, { align: 'right' })
               .text('Shipping:', 380, subtotalPosition + 40)
               .text(`${invoice.pricing.currency} ${invoice.pricing.shippingCharges || 0}`, 0, subtotalPosition + 40, { align: 'right' });

            doc.fontSize(15)
               .text('Total:', 380, subtotalPosition + 70)
               .text(`${invoice.pricing.currency} ${invoice.pricing.total}`, 0, subtotalPosition + 70, { align: 'right' });

            // Footer
            doc.fontSize(10)
               .text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });

            doc.end();
        });
    }

    async generateEstimatePdf(estimate: Estimate, settings: GeneralSettings): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Similar layout for Estimate
            if (settings) {
                doc.fillColor('#444444')
                    .fontSize(20)
                    .text(settings.siteName || 'Estimate', 50, 50);
                
                doc.fontSize(10)
                    .text(settings.address || '', 50, 80)
                    .text(settings.contactPhone || '', 50, 95)
                    .text(settings.contactEmail || '', 50, 110);
            } else {
                doc.fillColor('#444444')
                    .fontSize(20)
                    .text('Estimate', 50, 50);
            }

            doc.fillColor('#444444')
                .fontSize(20)
                .text('ESTIMATE', 50, 160, { align: 'right' });

            this.generateHr(doc, 185);

            const customer = estimate.customer || {};
            const customerName = customer.name || (customer.firstName ? (customer.firstName + ' ' + (customer.lastName || '')) : 'Customer');

            doc.fontSize(10)
               .text(`Estimate Number: ${estimate.estimateNumber}`, 50, 200)
               .text(`Date: ${new Date().toLocaleDateString()}`, 50, 215)
               .text(`Valid Until: ${new Date(estimate.validUntil).toLocaleDateString()}`, 50, 230)
               .text('To:', 300, 200)
               .text(customerName, 300, 215)
               .text(customer.address || '', 300, 230);

            this.generateHr(doc, 270);

            // Table Header
            let tableTop = 330;
            doc.fontSize(10);
            this.generateTableRow(doc, tableTop, 'Item', '', 'Qty', 'Price', '', '', 'Total');
            this.generateHr(doc, tableTop + 20);

            const items = estimate.items || [];
            items.forEach((item, i) => {
                const position = tableTop + (i + 1) * 30;
                this.generateTableRow(
                    doc,
                    position,
                    item.productName || 'Product',
                    '',
                    item.quantity.toString(),
                    `${item.price}`,
                    '',
                    '',
                    `${item.total}`
                );
                this.generateHr(doc, position + 20);
            });

            const subtotalPosition = tableTop + (items.length + 1) * 30 + 20;
            doc.fontSize(12)
               .text('Estimated Total:', 380, subtotalPosition)
               .text(`${estimate.pricing.currency || 'INR'} ${estimate.pricing.total}`, 0, subtotalPosition, { align: 'right' });

            doc.fontSize(10)
               .text('Prices are valid until the expiration date mentioned above.', 50, 700, { align: 'center', width: 500 });

            doc.end();
        });
    }

    private generateHr(doc: PDFKit.PDFDocument, y: number) {
        doc.strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();
    }

    private generateTableRow(
        doc: PDFKit.PDFDocument, 
        y: number, 
        item: string, 
        hsn: string, 
        quantity: string, 
        price: string, 
        taxRate: string, 
        taxAmt: string, 
        total: string
    ) {
        doc.fontSize(10);
        
        // Item (X=50, Width=150)
        doc.text(item, 50, y, { width: 140 });
        
        // HSN (X=200, Width=50)
        doc.text(hsn, 200, y, { width: 45, align: 'right' });
        
        // Qty (X=250, Width=40)
        doc.text(quantity, 250, y, { width: 35, align: 'right' });
        
        // Price (X=295, Width=70)
        doc.text(price, 295, y, { width: 65, align: 'right' });
        
        // Tax % (X=365, Width=45)
        doc.text(taxRate, 365, y, { width: 40, align: 'right' });
        
        // Tax Amt (X=410, Width=70)
        doc.text(taxAmt, 410, y, { width: 65, align: 'right' });
        
        // Total (X=485, Width=65)
        doc.text(total, 485, y, { width: 65, align: 'right' });
    }
}
