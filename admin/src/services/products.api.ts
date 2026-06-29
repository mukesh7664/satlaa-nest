import { fetchWithAuth } from "@/utils/apiUtils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

export interface Product {
  id?: string;
  _id?: string;
  slug?: string;
  sku?: string;
  is_variant?: boolean;
  parentId?: string;
  categoryId?: string;
  storeId?: string;
  productInfo: {
    title: string;
    name?: string; // fallback for legacy
    description?: string;
    category?: string;
    brand?: string;
    productType?: string;
    stock?: number;
    hsn_code?: string;
    tax_rate?: number;
  };
  price?: number;
  stock?: number;
  displayPrice?: string; // pre-formatted range or single price from backend
  simplePricing?: {
    basePrice?: number;
    costPrice?: number;
    stockQuantity?: number;
    sku?: string;
    currency?: string;
  };
  isActive?: boolean;
  isFeatured?: boolean;
  metadata?: any;
  pricing?: any;
  attributes?: Record<string, any>;
  variants?: any[];
  createdAt?: string;
  updatedAt?: string;
  media?: any;
  icon?: any;
  images?: any[];
  isBundle?: boolean;
  productStructureType?: string;
  bundleItems?: any[];
  productDetails?: any;
  seo?: any;
  manualCurrencyPrices?: Record<string, number>;
  is_returnable?: boolean;
  is_replaceable?: boolean;
  return_window_days?: number;
  purchaseType?: string;
}

class ProductsApiService {
  async getAllProducts(params?: any) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage?${queryParams}`
    );

    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
  }

  async getUniqueTags() {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage/tags/unique`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch tags");
    }

    const result = await response.json();
    return result.tags || [];
  }

  async getProductById(id: string) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage/${id}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch product");
    }

    const result = await response.json();
    return result.data || result;
  }

  async createProduct(data: any) {
    let bodyData: any;
    if (data instanceof FormData) {
      const plainObject: Record<string, any> = {};
      data.forEach((value, key) => {
        if (typeof value === "string") {
          try {
            plainObject[key] = JSON.parse(value);
          } catch {
            plainObject[key] = value;
          }
        } else {
          plainObject[key] = value;
        }
      });
      bodyData = JSON.stringify(plainObject);
    } else {
      bodyData = JSON.stringify(data);
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create product");
    }
    return response.json();
  }

  async updateProduct(id: string, data: any) {
    let bodyData: any;
    if (data instanceof FormData) {
      const plainObject: Record<string, any> = {};
      data.forEach((value, key) => {
        if (typeof value === "string") {
          try {
            plainObject[key] = JSON.parse(value);
          } catch {
            plainObject[key] = value;
          }
        } else {
          plainObject[key] = value;
        }
      });
      bodyData = JSON.stringify(plainObject);
    } else {
      bodyData = JSON.stringify(data);
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: bodyData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update product");
    }
    return response.json();
  }


  async toggleProductStatus(id: string) {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/products-manage/${id}/status`, { method: "PATCH" });
    if (!response.ok) throw new Error("Failed to toggle status");
    return response.json();
  }

  async toggleProductFeatured(id: string) {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/products-manage/${id}/featured`, { method: "PATCH" });
    if (!response.ok) throw new Error("Failed to toggle featured");
    return response.json();
  }

  async deleteProduct(id: string) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage/${id}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete product");
    }
    return response.json();
  }

  async exportProductsCsv() {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/products-manage/export/csv`, {
      method: "GET",
    });
    if (!response.ok) throw new Error("Failed to export products");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async exportProductsJson() {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/products-manage/export/json`, {
      method: "GET",
    });
    if (!response.ok) throw new Error("Failed to export products");
    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async importProducts(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = file.name.endsWith('.json') ? 'import/json' : 'import/csv';

    const response = await fetchWithAuth(`${API_BASE_URL}/admin/products-manage/${endpoint}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to import products");
    }
    return response.json();
  }

  async getProductQrCode(id: string) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage/${id}/qr-code`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch QR Code");
    }

    return response.json();
  }

  // ================= REVIEWS =================

  async getProductReviews(productId: string) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage/${productId}/reviews`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch product reviews");
    }
    return response.json();
  }

  async createProductReview(productId: string, data: { customerName: string; customerEmail?: string; rating: number; comment: string }) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage/${productId}/reviews`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create review");
    }
    return response.json();
  }

  async updateReviewStatus(reviewId: string, status: 'approved' | 'rejected' | 'pending') {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage/reviews/${reviewId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update review status");
    }
    return response.json();
  }

  async deleteReview(reviewId: string) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/products-manage/reviews/${reviewId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete review");
    }
    return response.json();
  }
}

export const productsApi = new ProductsApiService();
