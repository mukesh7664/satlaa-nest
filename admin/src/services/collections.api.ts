const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

export interface Collection {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  type: "manual" | "automatic";
  products?: string[];
  rules?: {
    tags?: any[];
    conditions?: "all" | "any";
  };
  image?: string;
  icon?: string;
  showInSearchBar?: boolean;
  showInFilterBar?: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  productCount: number;
}

class CollectionsApiService {
  private getAuthHeaders() {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async getAllCollections(
    params: {
      type?: string;
      isActive?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    success: boolean;
    collections: Collection[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append("type", params.type);
    if (params.isActive !== undefined)
      queryParams.append("isActive", String(params.isActive));
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", String(params.page));
    if (params.limit) queryParams.append("limit", String(params.limit));

    const response = await fetch(
      `${API_BASE_URL}/admin/collections?${queryParams.toString()}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch collections");
    }

    return response.json();
  }

  async getCollectionById(id: string): Promise<{
    success: boolean;
    collection: Collection;
  }> {
    const response = await fetch(`${API_BASE_URL}/admin/collections/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch collection");
    }

    return response.json();
  }

  async getCollectionBySlug(slug: string): Promise<{
    success: boolean;
    collection: Collection;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/admin/collections/slug/${slug}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch collection by slug");
    }

    return response.json();
  }

  async createCollection(data: Partial<Collection> | FormData): Promise<{
    success: boolean;
    message: string;
    collection: Collection;
  }> {
    const isFormData = data instanceof FormData;

    const response = await fetch(`${API_BASE_URL}/admin/collections`, {
      method: "POST",
      headers: isFormData
        ? { Authorization: this.getAuthHeaders().Authorization }
        : this.getAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create collection");
    }

    return response.json();
  }

  async updateCollection(
    id: string,
    data: Partial<Collection> | FormData
  ): Promise<{
    success: boolean;
    message: string;
    collection: Collection;
  }> {
    const isFormData = data instanceof FormData;

    const response = await fetch(`${API_BASE_URL}/admin/collections/${id}`, {
      method: "PUT",
      headers: isFormData
        ? { Authorization: this.getAuthHeaders().Authorization }
        : this.getAuthHeaders(),
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update collection");
    }

    return response.json();
  }

  async deleteCollection(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/admin/collections/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete collection");
    }

    return response.json();
  }

  async addProductsToCollection(
    collectionId: string,
    productIds: string[]
  ): Promise<{
    success: boolean;
    message: string;
    collection: Collection;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/admin/collections/${collectionId}/products`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ productIds }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to add products to collection");
    }

    return response.json();
  }

  async removeProductsFromCollection(
    collectionId: string,
    productIds: string[]
  ): Promise<{
    success: boolean;
    message: string;
    collection: Collection;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/admin/collections/${collectionId}/products`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ productIds }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove products from collection");
    }

    return response.json();
  }

  async searchCollections(query: string): Promise<{
    success: boolean;
    collections: Collection[];
  }> {
    const response = await fetch(
      `${API_BASE_URL}/admin/collections?search=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search collections");
    }

    return response.json();
  }

  async toggleStatus(id: string): Promise<{
    success: boolean;
    message: string;
    collection: Collection;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/admin/collections/${id}/status`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to toggle collection status");
    }

    return response.json();
  }

  async reorderProducts(
    collectionId: string,
    productIds: string[]
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/admin/collections/${collectionId}/products/reorder`,
      {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ productIds }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reorder products in collection");
    }

    return response.json();
  }
}

export const collectionsApi = new CollectionsApiService();
