import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as ExcelJS from 'exceljs';
const PDFDocument = require('pdfkit');
import { Product } from '../../catalog/entities/product.entity';
import { Order } from '../../sales/entities/order.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Invoice } from '../../sales/entities/invoice.entity';
import { Inquiry } from '../../communication/entities/inquiry.entity';
import { Response } from 'express';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
  ) {}

  async getAvailableColumns(type: string) {
    const columnsConfig = {
      products: [
        { key: 'id', label: 'Product ID' },
        { key: 'sku', label: 'SKU' },
        { key: 'title', label: 'Product Name' },
        { key: 'category', label: 'Category' },
        { key: 'stock', label: 'Stock Quantity' },
        { key: 'price', label: 'Price' },
        { key: 'isActive', label: 'Status' },
        { key: 'createdAt', label: 'Created At' },
      ],
      orders: [
        { key: 'orderNumber', label: 'Order ID' },
        { key: 'createdAt', label: 'Date & Time' },
        { key: 'customerName', label: 'Customer Name' },
        { key: 'customerEmail', label: 'Customer Email' },
        { key: 'status', label: 'Fulfillment Status' },
        { key: 'paymentStatus', label: 'Payment Status' },
        { key: 'totalAmount', label: 'Total Amount' },
        { key: 'shippingAddress', label: 'Shipping Address' },
      ],
      customers: [
        { key: 'id', label: 'Customer ID' },
        { key: 'name', label: 'Full Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'createdAt', label: 'Account Created At' },
        { key: 'isActive', label: 'Status' },
      ],
      invoices: [
        { key: 'invoiceNumber', label: 'Invoice Number' },
        { key: 'orderNumber', label: 'Order ID' },
        { key: 'customerName', label: 'Billing Name' },
        { key: 'taxAmount', label: 'Tax Amount' },
        { key: 'totalAmount', label: 'Total Payable' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'invoiceDate', label: 'Invoice Date' },
      ],
      inquiries: [
        { key: 'id', label: 'Ticket ID' },
        { key: 'subject', label: 'Subject' },
        { key: 'fullName', label: 'Customer Name' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created At' },
      ],
    };

    if (!columnsConfig[type]) {
      throw new BadRequestException('Invalid report type');
    }

    return columnsConfig[type];
  }

  async exportReport(
    type: string,
    format: string,
    columns: string[],
    filters: any,
    res: Response,
  ) {
    const data = await this.fetchData(type, filters);
    const availableColumns = await this.getAvailableColumns(type);
    const selectedColumns = availableColumns.filter((col) =>
      columns.includes(col.key),
    );

    const reportTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Report`;

    switch (format.toLowerCase()) {
      case 'csv':
        return this.generateCSV(data, selectedColumns, res);
      case 'xlsx':
        return this.generateExcel(data, selectedColumns, reportTitle, res);
      case 'pdf':
        return this.generatePDF(data, selectedColumns, reportTitle, res);
      case 'json':
        return this.generateJSON(data, selectedColumns, res);
      default:
        throw new BadRequestException('Invalid format');
    }
  }

  private async fetchData(type: string, filters: any) {
    const { startDate, endDate } = filters;
    const dateFilter =
      startDate && endDate
        ? Between(new Date(startDate), new Date(endDate))
        : undefined;

    const where: any = {};
    if (dateFilter) {
      where.createdAt = dateFilter;
    }

    switch (type) {
      case 'products':
        return this.productRepository.find({
          where,
          relations: ['category'],
        });
      case 'orders':
        return this.orderRepository.find({
          where,
          relations: ['customer'],
        });
      case 'customers':
        return this.customerRepository.find({
          where,
        });
      case 'invoices':
        const invoiceWhere: any = {};
        if (startDate && endDate) {
          invoiceWhere.invoiceDate = Between(new Date(startDate), new Date(endDate));
        }
        return this.invoiceRepository.find({
          where: invoiceWhere,
          relations: ['order'],
        });
      case 'inquiries':
        return this.inquiryRepository.find({
          where,
        });
      default:
        throw new BadRequestException('Invalid report type');
    }
  }

  private formatData(data: any[], columns: any[]) {
    return data.map((item) => {
      const row = {};
      columns.forEach((col) => {
        let value = item[col.key];

        // Custom formatting based on keys
        if (col.key === 'category') {
          value = item.category?.name || 'N/A';
        } else if (col.key === 'customerName') {
          value = item.customer?.name || item.fullName || item.customer?.firstName || 'Guest';
        } else if (col.key === 'customerEmail') {
          value = item.customer?.email || item.email || 'N/A';
        } else if (col.key === 'orderNumber') {
          value = item.order?.orderNumber || item.orderNumber || 'N/A';
        } else if (col.key === 'totalAmount') {
          value = item.totalAmount || item.pricing?.total || 0;
        } else if (col.key === 'taxAmount') {
          value = item.taxAmount || item.pricing?.tax || 0;
        } else if (col.key === 'shippingAddress') {
          const addr = item.shippingAddress;
          value = addr ? `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.pincode || ''}` : 'N/A';
        } else if (col.key === 'isActive') {
          value = item.isActive ? 'Active' : 'Inactive';
        } else if (value instanceof Date) {
          value = value.toLocaleString();
        }

        row[col.label] = value;
      });
      return row;
    });
  }

  private generateCSV(data: any[], columns: any[], res: Response) {
    const formattedData = this.formatData(data, columns);
    const headers = columns.map((col) => col.label);
    const csvRows = [headers.join(',')];

    formattedData.forEach((row) => {
      const values = headers.map((header) => {
        const val = row[header];
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
    res.send(csvRows.join('\n'));
  }

  private async generateExcel(
    data: any[],
    columns: any[],
    title: string,
    res: Response,
  ) {
    const formattedData = this.formatData(data, columns);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    worksheet.columns = columns.map((col) => ({
      header: col.label,
      key: col.label,
      width: 25,
    }));

    worksheet.addRows(formattedData);

    // Styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  private generatePDF(data: any[], columns: any[], title: string, res: Response) {
    const formattedData = this.formatData(data, columns);
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = 100;
    const colWidth = (doc.page.width - 60) / columns.length;
    let currentTop = tableTop;

    doc.fontSize(10).font('Helvetica-Bold');
    columns.forEach((col, index) => {
      doc.text(col.label, 30 + index * colWidth, currentTop, {
        width: colWidth,
        align: 'left',
      });
    });

    doc.moveDown();
    currentTop += 20;
    doc.moveTo(30, currentTop).lineTo(doc.page.width - 30, currentTop).stroke();
    currentTop += 10;

    // Table Rows
    doc.font('Helvetica').fontSize(9);
    formattedData.forEach((row) => {
      // Check for page overflow
      if (currentTop > doc.page.height - 50) {
        doc.addPage();
        currentTop = 30;
      }

      columns.forEach((col, index) => {
        const value = row[col.label]?.toString() || '';
        doc.text(value, 30 + index * colWidth, currentTop, {
          width: colWidth,
          align: 'left',
        });
      });
      currentTop += 20;
    });

    doc.end();
  }

  private generateJSON(data: any[], columns: any[], res: Response) {
    const formattedData = this.formatData(data, columns);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=report.json');
    res.send(JSON.stringify(formattedData, null, 2));
  }
}
