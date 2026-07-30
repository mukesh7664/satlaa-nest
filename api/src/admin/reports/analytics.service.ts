import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../catalog/entities/product.entity';
import { Order } from '../../sales/entities/order.entity';
import { OrderItem } from '../../sales/entities/order-item.entity';
import { ReturnRequest } from '../../sales/entities/return-request.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Invoice } from '../../sales/entities/invoice.entity';
import { Inquiry } from '../../communication/entities/inquiry.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(ReturnRequest)
    private returnRequestRepository: Repository<ReturnRequest>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Inquiry)
    private inquiryRepository: Repository<Inquiry>,
  ) {}

  private parseDates(startDateStr?: string, endDateStr?: string) {
    const today = new Date();
    let start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    let end = today;

    if (startDateStr) {
      start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
    }
    if (endDateStr) {
      end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
    }

    // Previous period for comparison
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const prevStart = new Date(start.getTime() - diffTime);
    const prevEnd = new Date(start.getTime() - 1);

    return { start, end, prevStart, prevEnd };
  }

  // --- SALES ANALYTICS ---
  async getSalesAnalytics(startDateStr?: string, endDateStr?: string) {
    const { start, end, prevStart, prevEnd } = this.parseDates(startDateStr, endDateStr);

    // Current period metrics
    const currentMetrics = await this.orderRepository.createQueryBuilder('order')
      .select('SUM(CASE WHEN order.paymentStatus = :paid THEN order.totalAmount ELSE 0 END)', 'revenue')
      .addSelect('COUNT(order.id)', 'orders')
      .addSelect('SUM(CASE WHEN order.status = :cancelled THEN 1 ELSE 0 END)', 'cancelledOrders')
      .where('order.createdAt BETWEEN :start AND :end', { start, end, paid: 'paid', cancelled: 'cancelled' })
      .getRawOne();

    // Previous period metrics for growth calculation
    const prevMetrics = await this.orderRepository.createQueryBuilder('order')
      .select('SUM(CASE WHEN order.paymentStatus = :paid THEN order.totalAmount ELSE 0 END)', 'revenue')
      .addSelect('COUNT(order.id)', 'orders')
      .where('order.createdAt BETWEEN :start AND :end', { start: prevStart, end: prevEnd, paid: 'paid' })
      .getRawOne();

    // Refund calculation
    const refundData = await this.returnRequestRepository.createQueryBuilder('rr')
      .select('SUM(rr.refundAmount)', 'refundAmount')
      .where('rr.status = :completed', { completed: 'COMPLETED' })
      .andWhere('rr.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();

    const revenue = parseFloat(currentMetrics.revenue || 0);
    const orders = parseInt(currentMetrics.orders || 0, 10);
    const cancelledOrders = parseInt(currentMetrics.cancelledOrders || 0, 10);
    const refundAmount = parseFloat(refundData?.refundAmount || 0);
    const aov = orders > 0 ? revenue / orders : 0;

    const prevRevenue = parseFloat(prevMetrics.revenue || 0);
    const prevOrders = parseInt(prevMetrics.orders || 0, 10);
    const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;

    // Charts: Sales Over Time
    const chartData = await this.orderRepository.createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(CASE WHEN order.paymentStatus = :paid THEN order.totalAmount ELSE 0 END)', 'revenue')
      .addSelect('COUNT(order.id)', 'orders')
      .where('order.createdAt BETWEEN :start AND :end', { start, end, paid: 'paid' })
      .groupBy("TO_CHAR(order.createdAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    // Orders status distribution
    const statusData = await this.orderRepository.createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.totalAmount)', 'value')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('order.status')
      .getRawMany();

    // Payment Methods
    const paymentData = await this.orderRepository.createQueryBuilder('order')
      .select('order.paymentMethod', 'method')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.totalAmount)', 'value')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('order.paymentMethod')
      .getRawMany();

    // Heatmap (7 Days x 24 Hours)
    const rawHeatmap = await this.orderRepository.createQueryBuilder('order')
      .select('EXTRACT(ISODOW FROM order.createdAt)', 'day')
      .addSelect('EXTRACT(HOUR FROM order.createdAt)', 'hour')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('day, hour')
      .getRawMany();

    return {
      kpis: {
        revenue,
        orders,
        aov,
        cancelledOrders,
        refundAmount,
        growth: {
          revenue: prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
          orders: prevOrders > 0 ? ((orders - prevOrders) / prevOrders) * 100 : 0,
          aov: prevAov > 0 ? ((aov - prevAov) / prevAov) * 100 : 0,
        },
      },
      chartData: chartData.map((d) => ({
        date: d.date,
        revenue: parseFloat(d.revenue || 0),
        orders: parseInt(d.orders || 0, 10),
      })),
      statusDistribution: statusData.map((s) => ({
        status: s.status,
        count: parseInt(s.count || 0, 10),
        value: parseFloat(s.value || 0),
      })),
      paymentBreakdown: paymentData.map((p) => ({
        method: p.method || 'Unspecified',
        count: parseInt(p.count || 0, 10),
        value: parseFloat(p.value || 0),
      })),
      heatmap: rawHeatmap.map((h) => ({
        day: parseInt(h.day, 10),
        hour: parseInt(h.hour, 10),
        count: parseInt(h.count || 0, 10),
      })),
    };
  }

  // --- PRODUCT ANALYTICS ---
  async getProductAnalytics(startDateStr?: string, endDateStr?: string) {
    const { start, end } = this.parseDates(startDateStr, endDateStr);

    // Dynamic product KPIs
    const outOfStock = await this.productRepository.createQueryBuilder('product')
      .where('product.stock <= 0')
      .getCount();

    const lowStock = await this.productRepository.createQueryBuilder('product')
      .where('product.stock > 0 AND product.stock <= 10')
      .getCount();

    const totalSKUs = await this.productRepository.createQueryBuilder('product')
      .getCount();

    // Top Products by Revenue and Quantity
    const topProducts = await this.orderItemRepository.createQueryBuilder('item')
      .select('item.productId', 'productId')
      .addSelect('item.productName', 'title')
      .addSelect('item.sku', 'sku')
      .addSelect('SUM(item.quantity)', 'unitsSold')
      .addSelect('SUM(item.totalPrice)', 'revenue')
      .innerJoin('item.order', 'order')
      .where('order.paymentStatus = :status', { status: 'paid' })
      .andWhere('order.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('item.productId, item.productName, item.sku')
      .orderBy('revenue', 'DESC')
      .limit(10)
      .getRawMany();

    // Category breakdown
    const categoryData = await this.orderItemRepository.createQueryBuilder('item')
      .select('category.name', 'categoryName')
      .addSelect('SUM(item.quantity)', 'unitsSold')
      .addSelect('SUM(item.totalPrice)', 'revenue')
      .innerJoin('item.order', 'order')
      .innerJoin('products', 'product', 'product.id = item.productId')
      .innerJoin('categories', 'category', 'category.id = product.categoryId')
      .where('order.paymentStatus = :status', { status: 'paid' })
      .andWhere('order.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('category.name')
      .getRawMany();

    // Dead Stock (Active products with NO sales in the selected period)
    const deadStockQuery = `
      SELECT p.id, p.title, p.sku, p.stock, p.price
      FROM products p
      WHERE p."isActive" = true AND p.stock > 0
        AND p.id NOT IN (
          SELECT DISTINCT oi."productId"
          FROM order_items oi
          INNER JOIN orders o ON o.id = oi."orderId"
          WHERE o."createdAt" BETWEEN $1 AND $2
        )
      LIMIT 10
    `;
    const deadStock = await this.productRepository.query(deadStockQuery, [start, end]);

    return {
      kpis: {
        totalSKUs,
        outOfStock,
        lowStock,
        bestSeller: topProducts[0]?.title || 'None',
        topRevenueProduct: topProducts[0]?.title || 'None',
      },
      topProducts: topProducts.map((p) => ({
        productId: p.productId,
        title: p.title,
        sku: p.sku || 'N/A',
        unitsSold: parseInt(p.unitsSold || 0, 10),
        revenue: parseFloat(p.revenue || 0),
      })),
      categoryBreakdown: categoryData.map((c) => ({
        category: c.categoryName || 'Uncategorized',
        unitsSold: parseInt(c.unitsSold || 0, 10),
        revenue: parseFloat(c.revenue || 0),
      })),
      deadStock: deadStock.map((d: any) => ({
        id: d.id,
        title: d.title,
        sku: d.sku || 'N/A',
        stock: parseInt(d.stock || 0, 10),
        price: parseFloat(d.price || 0),
      })),
    };
  }

  // --- CUSTOMER ANALYTICS ---
  async getCustomerAnalytics(startDateStr?: string, endDateStr?: string) {
    const { start, end } = this.parseDates(startDateStr, endDateStr);

    const totalCustomers = await this.customerRepository.createQueryBuilder('customer')
      .getCount();

    const newCustomers = await this.customerRepository.createQueryBuilder('customer')
      .where('customer.createdAt BETWEEN :start AND :end', { start, end })
      .getCount();

    // Top Customers table
    const topCustomers = await this.orderRepository.createQueryBuilder('order')
      .select('customer.id', 'customerId')
      .addSelect('customer.name', 'name')
      .addSelect('customer.email', 'email')
      .addSelect('COUNT(order.id)', 'ordersCount')
      .addSelect('SUM(order.totalAmount)', 'totalspent')
      .innerJoin('order.customer', 'customer')
      .where('order.paymentStatus = :status', { status: 'paid' })
      .groupBy('customer.id, customer.name, customer.email')
      .orderBy('totalspent', 'DESC')
      .limit(10)
      .getRawMany();

    // Returning Customers count (customers with 2+ orders total)
    const returningSubquery = await this.orderRepository.createQueryBuilder('order')
      .select('order.customerId')
      .groupBy('order.customerId')
      .having('COUNT(order.id) > 1')
      .getRawMany();

    const returningCustomers = returningSubquery.length;
    const activeCustomers = totalCustomers;
    const avgLtv = activeCustomers > 0 ? (await this.orderRepository.createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'sum')
      .where('order.paymentStatus = :paid', { paid: 'paid' })
      .getRawOne()).sum / activeCustomers : 0;

    // Geographic State-wise breakdown
    const geographicData = await this.orderRepository.createQueryBuilder('order')
      .select('("order"."shippingAddress"->>\'state\')', 'state')
      .addSelect('COUNT(order.id)', 'ordersCount')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .where('"order"."shippingAddress"->>\'state\' IS NOT NULL')
      .groupBy('("order"."shippingAddress"->>\'state\')')
      .orderBy('revenue', 'DESC')
      .getRawMany();

    // Churn Predictor: Active (order in last 30d), At Risk (30-90d), Churned (90d+)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const customerLastOrderDates = await this.orderRepository.createQueryBuilder('order')
      .select('order.customerId', 'customerId')
      .addSelect('MAX(order.createdAt)', 'lastOrder')
      .where('order.customerId IS NOT NULL')
      .groupBy('order.customerId')
      .getRawMany();

    let activeCount = 0;
    let atRiskCount = 0;
    let churnedCount = 0;

    customerLastOrderDates.forEach((c) => {
      const lastOrder = new Date(c.lastOrder);
      if (lastOrder >= thirtyDaysAgo) activeCount++;
      else if (lastOrder >= ninetyDaysAgo) atRiskCount++;
      else churnedCount++;
    });

    return {
      kpis: {
        totalCustomers,
        newCustomers,
        returningCustomers,
        retentionRate: totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0,
        avgLtv: Number(avgLtv) || 0,
      },
      topCustomers: topCustomers.map((c) => ({
        id: c.customerId,
        name: c.name || 'Anonymous',
        email: c.email || 'N/A',
        ordersCount: parseInt(c.ordersCount || 0, 10),
        totalSpent: parseFloat(c.totalspent || c.totalSpent || 0),
      })),
      geographicDistribution: geographicData.map((g) => ({
        state: g.state,
        ordersCount: parseInt(g.ordersCount || 0, 10),
        revenue: parseFloat(g.revenue || 0),
      })),
      churnSegments: {
        active: activeCount,
        atRisk: atRiskCount,
        churned: churnedCount,
      },
    };
  }

  // --- FINANCIAL REPORTS ---
  async getFinancialReports(startDateStr?: string, endDateStr?: string) {
    const { start, end } = this.parseDates(startDateStr, endDateStr);

    // Revenue breakdowns
    const orderSums = await this.orderRepository.createQueryBuilder('order')
      .select('SUM(order.subtotal)', 'subtotal')
      .addSelect('SUM(order.taxAmount)', 'tax')
      .addSelect('SUM(order.shippingCost)', 'shipping')
      .addSelect('SUM(order.discountAmount)', 'discount')
      .addSelect('SUM(order.totalAmount)', 'total')
      .where('order.paymentStatus = :status', { status: 'paid' })
      .andWhere('order.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();

    const refundSums = await this.returnRequestRepository.createQueryBuilder('rr')
      .select('SUM(rr.refundAmount)', 'refund')
      .where('rr.status = :status', { status: 'COMPLETED' })
      .andWhere('rr.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();

    const gross = parseFloat(orderSums.subtotal || 0) + parseFloat(orderSums.tax || 0) + parseFloat(orderSums.shipping || 0);
    const discounts = parseFloat(orderSums.discount || 0);
    const tax = parseFloat(orderSums.tax || 0);
    const shipping = parseFloat(orderSums.shipping || 0);
    const refunds = parseFloat(refundSums.refund || 0);
    const netRevenue = gross - discounts - refunds;

    // GST/CGST/SGST details (Simulated breakdown or standard order-level extraction)
    const taxReport = await this.orderRepository.createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'YYYY-MM')", 'month')
      .addSelect('SUM(order.taxAmount)', 'tax')
      .addSelect('SUM(order.subtotal)', 'taxableValue')
      .where('order.paymentStatus = :status', { status: 'paid' })
      .andWhere('order.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy("TO_CHAR(order.createdAt, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      kpis: {
        gross,
        discounts,
        refunds,
        netRevenue,
        tax,
        shipping,
      },
      revenueBreakdown: {
        gross,
        discounts,
        refunds,
        netRevenue,
        tax,
        shipping,
      },
      taxReport: taxReport.map((t) => {
        const totalTax = parseFloat(t.tax || 0);
        return {
          month: t.month,
          cgst: totalTax / 2, // Simple 50-50 CGST/SGST breakdown model
          sgst: totalTax / 2,
          igst: 0,
          totalGST: totalTax,
          taxableValue: parseFloat(t.taxableValue || 0),
        };
      }),
    };
  }

  // --- MARKETING & DISCOUNT ANALYTICS ---
  async getMarketingAnalytics(startDateStr?: string, endDateStr?: string) {
    const { start, end } = this.parseDates(startDateStr, endDateStr);

    const discountSummary = await this.orderRepository.createQueryBuilder('order')
      .select('SUM(order.discountAmount)', 'totalDiscount')
      .addSelect('COUNT(order.id)', 'totalUses')
      .where('order.discountCode IS NOT NULL')
      .andWhere('order.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();

    // Coupon performance table
    const couponPerformance = await this.orderRepository.createQueryBuilder('order')
      .select('order.discountCode', 'code')
      .addSelect('COUNT(order.id)', 'uses')
      .addSelect('SUM(order.discountAmount)', 'discountGiven')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .where('order.discountCode IS NOT NULL')
      .andWhere('order.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('order.discountCode')
      .orderBy('uses', 'DESC')
      .getRawMany();

    // AOV Comparison: Orders WITH coupon vs WITHOUT
    const aovComparison = await this.orderRepository.createQueryBuilder('order')
      .select('CASE WHEN order.discountCode IS NOT NULL THEN true ELSE false END', 'hasDiscount')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('CASE WHEN order.discountCode IS NOT NULL THEN true ELSE false END')
      .getRawMany();

    let withCouponAov = 0;
    let withoutCouponAov = 0;

    aovComparison.forEach((a) => {
      const count = parseInt(a.count || 0, 10);
      const revenue = parseFloat(a.revenue || 0);
      const aov = count > 0 ? revenue / count : 0;
      if (a.hasDiscount === 'true' || a.hasDiscount === true) {
        withCouponAov = aov;
      } else {
        withoutCouponAov = aov;
      }
    });

    return {
      kpis: {
        totalDiscount: parseFloat(discountSummary?.totalDiscount || 0),
        couponUsesCount: parseInt(discountSummary?.totalUses || 0, 10),
        mostUsedCoupon: couponPerformance[0]?.code || 'None',
        couponAov: withCouponAov,
        regularAov: withoutCouponAov,
      },
      coupons: couponPerformance.map((c) => ({
        code: c.code,
        uses: parseInt(c.uses || 0, 10),
        discountGiven: parseFloat(c.discountGiven || 0),
        revenue: parseFloat(c.revenue || 0),
        roi: parseFloat(c.discountGiven) > 0 ? parseFloat(c.revenue) / parseFloat(c.discountGiven) : 0,
      })),
    };
  }

  // --- OPERATIONS & FULFILLMENT ---
  async getOperationsAnalytics(startDateStr?: string, endDateStr?: string) {
    const { start, end } = this.parseDates(startDateStr, endDateStr);

    // Count pending return requests, average times
    const returnReasons = await this.returnRequestRepository.createQueryBuilder('rr')
      .select('rr.reason', 'reason')
      .addSelect('COUNT(rr.id)', 'count')
      .groupBy('rr.reason')
      .orderBy('count', 'DESC')
      .getRawMany();

    const totalOrdersCount = await this.orderRepository.createQueryBuilder('order')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .getCount();

    const returnRequestsCount = await this.returnRequestRepository.createQueryBuilder('rr')
      .where('rr.createdAt BETWEEN :start AND :end', { start, end })
      .getCount();

    const pendingShipments = await this.orderRepository.createQueryBuilder('order')
      .where('order.status IN (:...statuses)', { statuses: ['pending', 'confirmed', 'processing'] })
      .getCount();

    return {
      kpis: {
        pendingShipments,
        totalOrdersCount,
        returnRequestsCount,
        returnRate: totalOrdersCount > 0 ? (returnRequestsCount / totalOrdersCount) * 100 : 0,
      },
      returnReasons: returnReasons.map((r) => ({
        reason: r.reason || 'Unspecified',
        count: parseInt(r.count || 0, 10),
      })),
    };
  }

  // --- INVENTORY SNAPSHOT ---
  async getInventorySnapshot() {
    const stockSummary = await this.productRepository.createQueryBuilder('product')
      .select('SUM(product.stock * product.price)', 'totalValuation')
      .addSelect('COUNT(product.id)', 'skuCount')
      .addSelect('SUM(CASE WHEN product.stock <= 0 THEN 1 ELSE 0 END)', 'outOfStock')
      .addSelect('SUM(CASE WHEN product.stock > 0 AND product.stock <= 10 THEN 1 ELSE 0 END)', 'lowStock')
      .getRawOne();

    const lowStockAlerts = await this.productRepository.createQueryBuilder('product')
      .select('product.id', 'id')
      .addSelect('product.title', 'title')
      .addSelect('product.sku', 'sku')
      .addSelect('product.stock', 'stock')
      .addSelect('product.price', 'price')
      .where('product.stock <= 10')
      .orderBy('product.stock', 'ASC')
      .limit(20)
      .getRawMany();

    return {
      kpis: {
        skuCount: parseInt(stockSummary?.skuCount || 0, 10),
        outOfStock: parseInt(stockSummary?.outOfStock || 0, 10),
        lowStock: parseInt(stockSummary?.lowStock || 0, 10),
        totalValuation: parseFloat(stockSummary?.totalValuation || 0),
      },
      lowStockAlerts: lowStockAlerts.map((l) => ({
        id: l.id,
        title: l.title,
        sku: l.sku || 'N/A',
        stock: parseInt(l.stock || 0, 10),
        price: parseFloat(l.price || 0),
      })),
    };
  }
}
