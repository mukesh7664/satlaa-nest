const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

export interface User {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  role: "user" | "admin" | "sub_admin";
  phone?: { countryCode: string; number: string };
  avatar?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  savedAddresses?: {
    id?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    label?: string;
    isDefault?: boolean;
  }[];
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class UsersApiService {
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

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);

    const response = await fetch(
      `${this.baseUrl}/admin/users?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch users");
    }

    const result = await response.json();

    return {
      users: result.data || [],
      total: result.pagination?.total || 0,
      page: result.pagination?.page || 1,
      limit: result.pagination?.limit || 10,
      totalPages: result.pagination?.pages || 0,
    };
  }

  async updateUserRole(userId: string, role: string): Promise<{ user: User }> {
    const response = await fetch(`${this.baseUrl}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user role");
    }

    return response.json();
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }
  }

  async getUser(userId: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user details");
    }

    const result = await response.json();
    return result.data;
  }

  async getUserOrders(userId: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/admin/orders/user/${userId}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        JSON.stringify({
          status: response.status,
          message: error.message || "Failed to fetch user orders",
        })
      );
    }

    const result = await response.json();
    return result.data;
  }
}

export const usersApi = new UsersApiService();
