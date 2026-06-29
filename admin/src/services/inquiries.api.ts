const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

export interface Inquiry {
  id: string;
  type: "lead" | "inquiry" | "contact_us" | "quote";
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
  status: "pending" | "replied" | "converted";
  storeId?: string;
  createdAt: string;
  updatedAt: string;
  _id?: string; // For frontend compatibility
}

export interface InquiryStats {
  total: number;
  pending: number;
  replied: number;
  converted: number;
}

export interface InquiriesResponse {
  inquiries: Inquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class InquiriesApiService {
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

  async getInquiries(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<InquiriesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const response = await fetch(
      `${this.baseUrl}/communication/inquiry/admin?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch inquiries");
    }

    const data = await response.json();
    return {
      inquiries: data.data || [],
      total: data.pagination?.total || 0,
      page: data.pagination?.page || 1,
      limit: data.pagination?.limit || 10,
      totalPages: data.pagination?.pages || 0,
    };
  }

  async getInquiryById(id: string): Promise<{ inquiry: Inquiry }> {
    const response = await fetch(`${this.baseUrl}/communication/inquiry/admin/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch inquiry");
    }

    const data = await response.json();
    return { inquiry: data.data };
  }

  async updateInquiryStatus(
    id: string,
    status: string
  ): Promise<{ inquiry: Inquiry }> {
    const response = await fetch(
      `${this.baseUrl}/communication/inquiry/admin/${id}/status`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update inquiry status");
    }

    return response.json();
  }

  async deleteInquiry(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/communication/inquiry/admin/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete inquiry");
    }

    return response.json();
  }
}

export const inquiriesApi = new InquiriesApiService();
