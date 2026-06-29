const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface HeaderMenu {
  id: string;
  name: string;
  icon?: string;
  isHot: boolean;
  menuType:
  | "microsoft"
  | "adobe"
  | "autodesk"
  | "cloud"
  | "software"
  | "hardware"
  | "managed_solutions"
  | "digital_market";
  sortOrder: number;
  isActive: boolean;
  menuData: any;
  createdAt: string;
  updatedAt: string;
}

export interface HeaderMenuStats {
  total: number;
  active: number;
  inactive: number;
}

export interface HeaderMenusResponse {
  menus: HeaderMenu[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateHeaderMenuDto {
  name: string;
  icon?: string;
  isHot?: boolean;
  menuType: string;
  sortOrder?: number;
  isActive?: boolean;
  menuData: any;
}

export type UpdateHeaderMenuDto = Partial<CreateHeaderMenuDto>;

function normalizeHeaderMenu(raw: any): HeaderMenu {
  if (!raw) return raw;
  const id = raw.id || raw._id;
  return { ...raw, id, _id: undefined };
}

class HeaderMenuApiService {
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

  async getMenus(params?: {
    page?: number;
    limit?: number;
    search?: string;
    menuType?: string;
    isActive?: boolean;
  }): Promise<HeaderMenusResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.menuType) queryParams.append("menuType", params.menuType);
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const response = await fetch(
      `${this.baseUrl}/admin/header-menus?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch header menus");
    }

    const res = await response.json();
    const data = res.data;
    return {
      ...data,
      menus: data.menus.map(normalizeHeaderMenu),
    };
  }

  async getActiveMenus(): Promise<{ menus: HeaderMenu[] }> {
    const response = await fetch(`${this.baseUrl}/admin/header-menus/active`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch active menus");
    }

    const res = await response.json();
    return { menus: res.data.map(normalizeHeaderMenu) };
  }

  async getMenuById(id: string): Promise<{ menu: HeaderMenu }> {
    const response = await fetch(`${this.baseUrl}/admin/header-menus/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch menu");
    }

    const res = await response.json();
    return { menu: normalizeHeaderMenu(res.data) };
  }

  async getMenuByType(type: string): Promise<{ menu: HeaderMenu }> {
    const response = await fetch(
      `${this.baseUrl}/admin/header-menus/type/${type}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch menu");
    }

    const res = await response.json();
    return { menu: normalizeHeaderMenu(res.data) };
  }

  async getMenuStats(): Promise<HeaderMenuStats> {
    const response = await fetch(`${this.baseUrl}/admin/header-menus/stats`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch menu stats");
    }

    const res = await response.json();
    return res.data;
  }

  async createMenu(data: CreateHeaderMenuDto): Promise<{ menu: HeaderMenu }> {
    const response = await fetch(`${this.baseUrl}/admin/header-menus`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create menu");
    }

    const res = await response.json();
    return { menu: normalizeHeaderMenu(res.data) };
  }

  async updateMenu(
    id: string,
    data: UpdateHeaderMenuDto
  ): Promise<{ menu: HeaderMenu }> {
    const response = await fetch(`${this.baseUrl}/admin/header-menus/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update menu");
    }

    const res = await response.json();
    return { menu: normalizeHeaderMenu(res.data) };
  }

  async deleteMenu(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/header-menus/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete menu");
    }

    return response.json();
  }

  async updateSortOrder(
    id: string,
    sortOrder: number
  ): Promise<{ menu: HeaderMenu }> {
    const response = await fetch(
      `${this.baseUrl}/admin/header-menus/${id}/sort-order`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ sortOrder }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update sort order");
    }

    const res = await response.json();
    return { menu: normalizeHeaderMenu(res.data) };
  }

  async toggleActive(
    id: string,
    isActive: boolean
  ): Promise<{ menu: HeaderMenu }> {
    const response = await fetch(
      `${this.baseUrl}/admin/header-menus/${id}/toggle-active`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to toggle menu status");
    }

    const res = await response.json();
    return { menu: normalizeHeaderMenu(res.data) };
  }
}

export const headerMenuApi = new HeaderMenuApiService();
