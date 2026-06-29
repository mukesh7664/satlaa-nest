const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

export interface Customer {
  id: string;
  _id: string; // Used by frontend for backward compatibility
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string | { countryCode: string; number: string };
  isActive?: boolean;
  addresses?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class CustomersApiService {
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

  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<CustomersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const response = await fetch(
      `${this.baseUrl}/admin/customers?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch customers");
    }

    const result = await response.json();

    return {
      data: result.data || [],
      pagination: {
        total: result.pagination?.total || 0,
        page: result.pagination?.page || 1,
        limit: result.pagination?.limit || 10,
        pages: result.pagination?.pages || 0,
      }
    };
  }

  async createCustomer(data: any): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/admin/customers`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create customer");
    }

    const result = await response.json();
    return result.data;
  }

  async updateCustomer(id: string, data: any): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/admin/customers/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update customer");
    }

    const result = await response.json();
    return result.data;
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/customers/${customerId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete customer");
    }
  }

  async getCustomer(customerId: string): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/admin/customers/${customerId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch customer details");
    }

    const result = await response.json();
    return result.data;
  }

  async getCustomerOrders(customerId: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/admin/orders/user/${customerId}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch customer orders");
    }

    const result = await response.json();
    return result.data;
  }
}

export const customersApi = new CustomersApiService();
