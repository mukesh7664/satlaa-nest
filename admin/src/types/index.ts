export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: {
    id: string;
    name: string;
    email: string;
  };
  items: {
    softwareId: {
      id: string;
      title: string;
    };
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'invoice_requested';
  paymentMethod: 'razorpay' | 'invoice';
  invoiceUrl?: string;
  invoiceNumber?: string;
  orderStatus: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface DashboardSummary {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingInvoices: number;
  contactRequests: number;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  createdAt: string;
}

export interface Software {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  category: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  invoiceUrl: string;
  status: 'pending' | 'issued' | 'paid';
  issuedBy: string;
  createdAt: string;
} 