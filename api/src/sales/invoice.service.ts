import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Order, OrderStatus } from './entities/order.entity';
import { EmailService } from '../notifications/email.service';
import { Customer } from '../customers/entities/customer.entity';
import { PdfService } from './pdf.service';
import { S3Service } from '../cms/s3.service';
import { GeneralSettings } from '../admin/entities/general-settings.entity';
import { getFullS3Url } from '../common/utils/s3-url.util';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
        @InjectRepository(GeneralSettings)
        private settingsRepository: Repository<GeneralSettings>,
        private emailService: EmailService,
        private pdfService: PdfService,
        private s3Service: S3Service,
    ) { }

    async createInvoice(data: any): Promise<Invoice> {
        const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const invoice = this.invoiceRepository.create({
            ...data,
            invoiceNumber,
            invoiceDate: data.invoiceDate || new Date(),
            dueDate: data.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            status: data.status || 'draft',
        });
        const savedInvoice = (await this.invoiceRepository.save(invoice)) as any;
        // Generate and store PDF
        await this.generateAndStorePdf(savedInvoice.id);
        return savedInvoice;
    }

    async createInvoiceFromOrder(orderId: string, adminId?: string): Promise<Invoice> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['items']
        });
        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        // Check if invoice already exists for this order
        const existingInvoice = await this.invoiceRepository.findOne({ where: { orderId } });
        if (existingInvoice) {
            return existingInvoice;
        }

        const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        const invoice = this.invoiceRepository.create({
            invoiceNumber,
            orderId: order.id,
            customerId: order.customerId,
            createdById: adminId,
            customer: order.billingAddress || order.shippingAddress || {}, // Use billing or fallback to shipping
            items: order.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                productSku: item.sku,
                price: item.price,
                quantity: item.quantity,
                tax_rate: (item as any).tax_rate || 0,
                tax_amount: (item as any).tax_amount || 0,
                total: item.totalPrice,
                hsn_code: item.hsn_code,
                selectedVariant: item.variantInfo
            })),
            pricing: {
                total: order.totalAmount,
                subtotal: order.subtotal,
                tax: order.taxAmount,
                shippingCharges: order.shippingCost,
                discount: order.discountAmount,
                currency: 'INR', // Default currency
            },
            amountPaid: 0,
            amountDue: order.totalAmount,
            status: 'draft',
            invoiceDate: new Date(),
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Due in 15 days by default
            notes: 'Thank you for your business.',
        });

        // If order is already paid or confirmed, update invoice status
        if (order.status === OrderStatus.CONFIRMED || 
            order.status === OrderStatus.PROCESSING || 
            order.status === OrderStatus.SHIPPED || 
            order.status === OrderStatus.DELIVERED) {
            invoice.status = 'sent';
        }

        // Robust check for payment status
        const isActuallyPaid = 
            order.paymentStatus === 'paid' || 
            order.paymentInfo?.status === 'paid' || 
            order.paymentInfo?.status === 'success' ||
            order.status === OrderStatus.DELIVERED;

        if (isActuallyPaid) {
            invoice.status = 'paid';
            invoice.amountPaid = order.totalAmount;
            invoice.amountDue = 0;
            invoice.paidAt = order.paymentInfo?.paidAt || new Date();
            
            // Create a payment record if it doesn't already have one in paymentInfo
            invoice.payments = [{
                amount: order.totalAmount,
                method: order.paymentMethod || order.paymentInfo?.method || 'online',
                transactionId: order.paymentInfo?.transactionId || 'N/A',
                date: invoice.paidAt,
            }];
        }

        // If customerId is still missing (guest order), try to find by email
        if (!invoice.customerId) {
            const email = order.billingAddress?.email || order.shippingAddress?.email;
            if (email) {
                const customer = await this.customerRepository.findOne({
                    where: { email }
                });
                if (customer) {
                    invoice.customerId = customer.id;
                }
            }
        }

        const savedInvoice = (await this.invoiceRepository.save(invoice)) as any;
        // Generate and store PDF
        await this.generateAndStorePdf(savedInvoice.id);
        return savedInvoice;
    }

    async findAllInvoices(customerId?: string, query: any = {}) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const qb = this.invoiceRepository.createQueryBuilder('invoice');

        if (customerId) {
            qb.andWhere('invoice.customerId = :customerId', { customerId });
        }
        if (query.status && query.status !== 'all') {
            qb.andWhere('invoice.status = :status', { status: query.status });
        }
        if (query.search) {
            qb.andWhere(
                '(invoice.invoiceNumber ILike :search OR invoice.customer->>\'name\' ILike :search OR invoice.customer->>\'email\' ILike :search)',
                { search: `%${query.search}%` }
            );
        }

        if (query.startDate) {
            qb.andWhere('invoice.invoiceDate >= :startDate', {
                startDate: new Date(query.startDate)
            });
        }

        if (query.endDate) {
            const endDate = new Date(query.endDate);
            endDate.setDate(endDate.getDate() + 1);
            qb.andWhere('invoice.invoiceDate < :endDate', { endDate });
        }

        qb.orderBy('invoice.createdAt', 'DESC')
          .take(limit)
          .skip(skip);

        const [data, total] = await qb.getManyAndCount();

        const mappedData = data.map(invoice => ({
            ...invoice,
            _id: invoice.id,
        }));

        return {
            data: mappedData,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async findOneInvoice(id: string, customerId?: string) {
        const where: any = { id };
        if (customerId) {
            where.customerId = customerId;
        }
        return this.invoiceRepository.findOne({ where });
    }

    async updateInvoice(id: string, body: any): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findOne({ where: { id } });
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }

        // Normalize items — ensure all numeric fields are numbers
        const items = (body.items || invoice.items || []).map((item: any) => ({
            ...item,
            price: Number(item.price) || 0,
            discount: Number(item.discount) || 0,
            tax: Number(item.tax) || 0,
            quantity: Number(item.quantity) || 1,
            subtotal: Number(item.subtotal) || Number(item.price) * Number(item.quantity) || 0,
            total: Number(item.total) || 0,
        }));

        // Recalculate pricing from items if provided
        const pricing = body.pricing || invoice.pricing;

        // Update customer info
        const customer = body.customer || invoice.customer;

        // Recalculate amountDue
        const total = Number(pricing?.total) || 0;
        const amountPaid = Number(invoice.amountPaid) || 0;
        const amountDue = Math.max(0, total - amountPaid);

        Object.assign(invoice, {
            customer,
            items,
            pricing,
            dueDate: body.dueDate ? new Date(body.dueDate) : invoice.dueDate,
            notes: body.notes !== undefined ? body.notes : invoice.notes,
            amountDue,
        });

        return this.invoiceRepository.save(invoice);
    }

    async deleteInvoice(id: string): Promise<void> {
        const invoice = await this.invoiceRepository.findOne({ where: { id } });
        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
        await this.invoiceRepository.remove(invoice);
    }

    async sendInvoice(id: string): Promise<{ success: boolean; message: string }> {
        const invoice = await this.invoiceRepository.findOne({ where: { id } });
        if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);

        // Ensure PDF is generated before sending email
        if (!invoice.pdfUrl) {
            await this.generateAndStorePdf(id);
            const updated = await this.invoiceRepository.findOne({ where: { id } });
            await this.emailService.sendInvoiceEmail(updated);
        } else {
            await this.emailService.sendInvoiceEmail(invoice);
        }

        // Mark as sent if still draft
        if (invoice.status === 'draft') {
            invoice.status = 'sent';
            await this.invoiceRepository.save(invoice);
        }
        return { success: true, message: 'Invoice sent to customer' };
    }

    async generateAndStorePdf(id: string): Promise<string> {
        const invoice = await this.invoiceRepository.findOne({ where: { id } });
        if (!invoice) throw new NotFoundException('Invoice not found');

        const settings = await this.settingsRepository.findOne({ where: {} });
        const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice, settings);

        const key = `invoice/${invoice.id}.pdf`;
        await this.s3Service.uploadBuffer(pdfBuffer, key, 'application/pdf');

        invoice.pdfUrl = key;
        await this.invoiceRepository.save(invoice);

        return getFullS3Url(key);
    }
}
