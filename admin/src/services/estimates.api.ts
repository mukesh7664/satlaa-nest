const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface EstimateItem {
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  product?: string;
  productImage?: string;
  brand?: string;
  brandName?: string;
  productType?: "software" | "hardware" | "service";
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  customer: CustomerInfo;
  items: EstimateItem[];
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
  };
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  validUntil: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEstimateDto {
  customer: CustomerInfo;
  items: EstimateItem[];
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
  };
  validUntil: string;
  notes?: string;
}

export interface UpdateEstimateDto extends Partial<CreateEstimateDto> {
  status?: Estimate["status"];
}

export interface EstimatesResponse {
  estimates: Estimate[];
  total: number;
  page: number;
  totalPages: number;
}

class EstimatesApiService {
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

  async getEstimates(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<EstimatesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status && params.status !== "all")
      queryParams.append("status", params.status);

    const response = await fetch(
      `${this.baseUrl}/admin/estimates?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch estimates");
    }

    const data = await response.json();
    return {
      estimates: data.data || [],
      total: data.pagination?.total || 0,
      page: data.pagination?.page || 1,
      totalPages: data.pagination?.pages || 0,
    };
  }

  async getEstimateById(id: string): Promise<Estimate> {
    const response = await fetch(`${this.baseUrl}/admin/estimates/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch estimate");
    }

    return response.json();
  }

  async createEstimate(data: CreateEstimateDto): Promise<Estimate> {
    const response = await fetch(`${this.baseUrl}/admin/estimates`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create estimate");
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateEstimate(id: string, data: UpdateEstimateDto): Promise<Estimate> {
    const response = await fetch(`${this.baseUrl}/admin/estimates/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update estimate");
    }

    const result = await response.json();
    return result.data || result;
  }

  async deleteEstimate(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/estimates/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete estimate");
    }
  }

  async sendEstimate(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/estimates/${id}/send`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send estimate");
    }
  }

  async downloadEstimate(id: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/admin/estimates/${id}/download`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download estimate");
    }

    return response.blob();
  }
}

export const estimatesApi = new EstimatesApiService();
