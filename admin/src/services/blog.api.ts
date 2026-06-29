import { fetchWithAuth } from "@/utils/apiUtils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

export interface BlogTerm {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  authorName?: string | null;
  status: "draft" | "published";
  publishedAt?: string | null;
  seo?: Record<string, any> | null;
  categories?: BlogTerm[];
  tags?: BlogTerm[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  authorName?: string | null;
  status?: "draft" | "published";
  publishedAt?: string | null;
  seo?: Record<string, any> | null;
  categoryIds?: string[];
  tagIds?: string[];
}

class BlogApiService {
  // ─── Posts ────────────────────────────────────────────────────────────────

  async getAllPosts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") queryParams.append(key, String(value));
      });
    }
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/blog/posts?${queryParams}`
    );
    if (!response.ok) throw new Error("Failed to fetch blog posts");
    return response.json();
  }

  async getPost(id: string): Promise<BlogPost> {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/blog/posts/${id}`);
    if (!response.ok) throw new Error("Failed to fetch blog post");
    return response.json();
  }

  async createPost(data: BlogPostPayload): Promise<BlogPost> {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/blog/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create blog post");
    }
    return response.json();
  }

  async updatePost(id: string, data: BlogPostPayload): Promise<BlogPost> {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/blog/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update blog post");
    }
    return response.json();
  }

  async toggleStatus(id: string) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/blog/posts/${id}/status`,
      { method: "PATCH" }
    );
    if (!response.ok) throw new Error("Failed to toggle status");
    return response.json();
  }

  async deletePost(id: string) {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/blog/posts/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete blog post");
    return response.json();
  }

  // ─── Categories ─────────────────────────────────────────────────────────────

  async getCategories(): Promise<BlogTerm[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/blog/categories`);
    if (!response.ok) throw new Error("Failed to fetch blog categories");
    return response.json();
  }

  async createCategory(data: { name: string; slug?: string; description?: string }) {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/blog/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create category");
    }
    return response.json();
  }

  async updateCategory(
    id: string,
    data: { name?: string; slug?: string; description?: string }
  ) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/blog/categories/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update category");
    }
    return response.json();
  }

  async deleteCategory(id: string) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/admin/blog/categories/${id}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error("Failed to delete category");
    return response.json();
  }

  // ─── Tags ─────────────────────────────────────────────────────────────────

  async getTags(): Promise<BlogTerm[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/blog/tags`);
    if (!response.ok) throw new Error("Failed to fetch blog tags");
    return response.json();
  }

  async createTag(data: { name: string; slug?: string }) {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/blog/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create tag");
    }
    return response.json();
  }

  async deleteTag(id: string) {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/blog/tags/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete tag");
    return response.json();
  }
}

export const blogApi = new BlogApiService();
