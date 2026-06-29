const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  category: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyDto {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  category: string;
  metaTitle?: string;
  metaDescription?: string;
}

export type UpdateCompanyDto = Partial<CreateCompanyDto>;

export interface CompaniesResponse {
  companies: Company[];
  totalPages: number;
  currentPage: number;
  totalCompanies: number;
}

class CompaniesApiService {
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

  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<CompaniesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category && params.category !== "all")
      queryParams.append("category", params.category);

    const response = await fetch(
      `${this.baseUrl}/admin/companies?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch companies");
    }

    return response.json();
  }

  async getCompanyById(id: string): Promise<Company> {
    const response = await fetch(`${this.baseUrl}/admin/companies/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch company");
    }

    return response.json();
  }

  async createCompany(data: CreateCompanyDto): Promise<Company> {
    const response = await fetch(`${this.baseUrl}/admin/companies`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create company");
    }

    return response.json();
  }

  async updateCompany(id: string, data: UpdateCompanyDto): Promise<Company> {
    const response = await fetch(`${this.baseUrl}/admin/companies/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update company");
    }

    return response.json();
  }

  async deleteCompany(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/admin/companies/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete company");
    }
  }
}

export const companiesApi = new CompaniesApiService();
