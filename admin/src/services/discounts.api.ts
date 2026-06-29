const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BOGO = 'BOGO',
  BUY_X_GET_Y_PERCENT = 'BUY_X_GET_Y_PERCENT',
}

export enum ApplyTo {
  ALL_ORDERS = 'ALL_ORDERS',
  SPECIFIC_PRODUCTS = 'SPECIFIC_PRODUCTS',
  SPECIFIC_CATEGORIES = 'SPECIFIC_CATEGORIES',
  CUSTOMER_LOYALTY = 'CUSTOMER_LOYALTY',
}

export interface Discount {
  id: string;
  storeId: string;
  name: string;
  code?: string;
  description?: string;
  type: DiscountType;
  value: number;
  min_order_value: number;
  max_discount_cap?: number;
  usage_limit?: number;
  per_user_limit: number;
  current_usage_count: number;
  buy_qty?: number;
  get_qty?: number;
  apply_to: ApplyTo;
  applicable_ids?: string[];
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateDiscountDto = Omit<Discount, "id" | "current_usage_count" | "createdAt" | "updatedAt" | "storeId">;
export type UpdateDiscountDto = Partial<CreateDiscountDto>;

export interface DiscountsResponse {
  discounts: Discount[];
  totalPages: number;
  currentPage: number;
  totalDiscounts: number;
}

class DiscountsApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getDiscounts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: string;
    type?: string;
  }): Promise<DiscountsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.is_active && params.is_active !== "all")
      queryParams.append("is_active", params.is_active);
    if (params?.type && params.type !== "all")
      queryParams.append("type", params.type);

    const response = await fetch(
      `${this.baseUrl}/admin/discounts?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch discounts");
    }

    return response.json();
  }

  async getDiscountById(id: string): Promise<Discount> {
    const response = await fetch(`${this.baseUrl}/admin/discounts/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch discount");
    }

    return response.json();
  }

  async createDiscount(data: CreateDiscountDto): Promise<Discount> {
    const response = await fetch(`${this.baseUrl}/admin/discounts`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create discount");
    }

    return response.json();
  }

  async updateDiscount(id: string, data: UpdateDiscountDto): Promise<Discount> {
    const response = await fetch(`${this.baseUrl}/admin/discounts/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update discount");
    }

    return response.json();
  }

  async deleteDiscount(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/discounts/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete discount");
    }
  }

  async toggleDiscountStatus(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/discounts/${id}/toggle`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to toggle discount status");
    }
  }
}

export const discountsApi = new DiscountsApiService();
