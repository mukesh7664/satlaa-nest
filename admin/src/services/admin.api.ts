import { fetchWithAuth } from "@/utils/apiUtils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

export interface Admin {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "super_admin" | "super_sub_admin" | "store_admin" | "store_sub_admin";
  adminType?: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    emailNotifications?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  role?: "super_admin" | "super_sub_admin" | "store_admin" | "store_sub_admin";
  adminType?: string;
  customType?: string;
  phone?: string;
  permissions?: string[];
}

export interface UpdateAdminData {
  name?: string;
  email?: string;
  password?: string;
  role?: "super_admin" | "super_sub_admin" | "store_admin" | "store_sub_admin";
  adminType?: string;
  customType?: string;
  phone?: string;
  permissions?: string[];
}

class AdminApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get all admin users
   */
  async getAdmins(): Promise<Admin[]> {
    const response = await fetchWithAuth(`${this.baseUrl}/admin/admins-list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch admins");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: string): Promise<Admin> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/admin/admins-list/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch admin");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Create a new admin user
   */
  async createAdmin(data: CreateAdminData): Promise<Admin> {
    const response = await fetchWithAuth(`${this.baseUrl}/admin/admins-list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create admin");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Update an admin user
   */
  async updateAdmin(id: string, data: UpdateAdminData): Promise<Admin> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/admin/admins-list/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update admin");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Delete an admin user
   */
  async deleteAdmin(id: string): Promise<void> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/admin/admins-list/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete admin");
    }
  }
}

export const adminApi = new AdminApiService();
