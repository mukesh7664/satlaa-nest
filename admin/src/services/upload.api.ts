const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";

class UploadApiService {
  private getAuthHeaders() {
    let token = null;

    if (typeof window !== "undefined") {
      const persistRoot = localStorage.getItem("persist:root");
      if (persistRoot) {
        try {
          const parsed = JSON.parse(persistRoot);
          const authState = JSON.parse(parsed.auth);
          token = authState.token;
        } catch (e) {
          console.error("Error parsing auth state:", e);
        }
      }
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async uploadImage(
    file: File,
    folder: string = "products",
    name?: string,
    alt?: string,
    isGlobal: boolean = false,
    tags: string[] = [],
    usageType: string = "other"
  ) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);
    if (name) formData.append("name", name);
    if (alt) formData.append("alt", alt);
    if (isGlobal) formData.append("isGlobal", "true");
    if (tags && tags.length > 0) formData.append("tags", tags.join(","));
    if (usageType) formData.append("usageType", usageType);

    const response = await fetch(`${API_BASE_URL}/admin/upload/image`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to upload image");
    }

    return response.json();
  }

  async listImages(
    page: number = 1,
    limit: number = 20,
    search?: string,
    type: string = "all",
    folder?: string,
    isGlobal?: boolean,
    tags?: string[]
  ) {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search) params.append("search", search);
    if (type && type !== "all") params.append("type", type);
    if (folder) params.append("folder", folder);
    if (isGlobal) params.append("isGlobal", "true");
    if (tags && tags.length > 0) params.append("tags", tags.join(","));

    const response = await fetch(
      `${API_BASE_URL}/admin/upload/list?${params.toString()}`,
      {
        method: "GET",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to list images");
    }

    return response.json();
  }

  async deleteImage(id: string) {
    const response = await fetch(
      `${API_BASE_URL}/admin/upload/delete?id=${id}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete image");
    }

    return response.json();
  }

  async updateMedia(
    id: string,
    data: { name?: string; alt?: string; tags?: string[]; usageType?: string }
  ) {
    const response = await fetch(`${API_BASE_URL}/admin/upload/${id}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update media");
    }

    return response.json();
  }

  async getTags() {
    const response = await fetch(`${API_BASE_URL}/admin/upload/tags`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch tags");
    }

    return response.json();
  }
}

export const uploadApi = new UploadApiService();
