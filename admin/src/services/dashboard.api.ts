const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

export interface DashboardSummary {
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalCollections: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  trends?: {
    salesTrend: number;
    incomeTrend: number;
    deliveredTrend: number;
    customersTrend: number;
  };
  paidOrdersCount?: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  pending_approval: number;
  confirmed: number;
  processed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

export interface MonthlyData {
  month: string;
  sales: number;
}

export interface TopCategory {
  name: string;
  count: number;
  revenue: number;
  productsCount: number;
}


export interface TopProduct {
  name: string;
  quantity: number;
  price: number;
  image?: string | null;
  brand?: string;
  isActive?: boolean;
  stock?: number | null;
}

export interface PaymentDistribution {
  cash_on_delivery: number;
  wallet: number;
  others: number;
}

export interface InHouseStore {
  totalSales: number;
  totalProducts: number;
  averageRating: number;
  totalOrders: number;
}

export interface TopCustomer {
  name: string;
  email: string;
  totalSpent: number;
  image: string | null;
}

export interface SetupStep {
  id: string;
  label: string;
  description: string;
  weight: number;
  isCompleted: boolean;
  redirectUrl: string;
}

export interface SetupStatus {
  emailConfigured: boolean;
  paymentConfigured: boolean;
  shippingConfigured: boolean;
  emailAllowed?: boolean;
  paymentAllowed?: boolean;
  shippingAllowed?: boolean;
  isComplete: boolean;
  completionPercentage: number;
  steps: SetupStep[];
}

export interface DashboardData {
  summary: DashboardSummary;
  orderStats: OrderStats;
  yearlyData: MonthlyData[];
  topCategories: TopCategory[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
  paymentDistribution: PaymentDistribution;
  inHouseStore: InHouseStore;
  setupStatus: SetupStatus;
}

class DashboardApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
      const error = await response.json();
      throw new Error(error.message || "Session expired. Please login again.");
    }
    return response;
  }

  private getAuthHeaders(): HeadersInit {
    // Standardize token retrieval to match authSlice
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getDashboardData(): Promise<DashboardData> {
    const response = await this.handleResponse(await fetch(
      `${this.baseUrl}/admin/dashboard/dashboard-summary`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    ));

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch dashboard data");
    }

    return response.json();
  }
}

export const dashboardApiService = new DashboardApiService();
