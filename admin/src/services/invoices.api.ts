const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface InvoiceItem {
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

export interface Invoice {
  id: string;
  _id: string;
  invoiceNumber: string;
  customer: CustomerInfo;
  items: InvoiceItem[];
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
  };
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | "refunded";
  dueDate: string;
  invoiceDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDto {
  customer: CustomerInfo;
  items: InvoiceItem[];
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
  };
  dueDate: string;
  invoiceDate: string;
  notes?: string;
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> {
  status?: Invoice["status"];
}

export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
  page: number;
  totalPages: number;
}

class InvoicesApiService {
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

  async getInvoices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<InvoicesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status && params.status !== "all")
      queryParams.append("status", params.status);

    const response = await fetch(
      `${this.baseUrl}/admin/invoices?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch invoices");
    }

    const data = await response.json();
    return {
      invoices: data.data || [],
      total: data.pagination?.total || 0,
      page: data.pagination?.page || 1,
      totalPages: data.pagination?.pages || 0,
    };
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/admin/invoices/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch invoice");
    }

    return response.json();
  }

  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/admin/invoices`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create invoice");
    }

    const result = await response.json();
    return result.data || result;
  }

  async updateInvoice(id: string, data: UpdateInvoiceDto): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/admin/invoices/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update invoice");
    }

    const result = await response.json();
    return result.data || result;
  }

  async deleteInvoice(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/invoices/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete invoice");
    }
  }

  async sendInvoice(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/invoices/${id}/send`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send invoice");
    }
  }

  async downloadInvoice(id: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/admin/invoices/${id}/download`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download invoice");
    }

    return response.blob();
  }
}

export const invoicesApi = new InvoicesApiService();
