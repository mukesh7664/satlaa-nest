const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003';

export interface Tag {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

class TagsApiService {
  private getAuthHeaders() {
    let token = null;

    if (typeof window !== 'undefined') {
      // Get token from Redux persist
      const persistRoot = localStorage.getItem('persist:root');
      if (persistRoot) {
        try {
          const parsed = JSON.parse(persistRoot);
          const authState = JSON.parse(parsed.auth);
          token = authState.token;
        } catch (e) {
          console.error('Error parsing auth state:', e);
        }
      }
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get all tags
   */
  async getAllTags(params?: { search?: string }): Promise<{ success: boolean; count: number; tags: Tag[] }> {
    const queryParams = new URLSearchParams();
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const response = await fetch(`${API_BASE_URL}/admin/tags?${queryParams.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch tags');
    return response.json();
  }

  /**
   * Search tags (for autocomplete)
   */
  async searchTags(query: string, limit: number = 10): Promise<{ success: boolean; count: number; tags: Tag[] }> {
    const response = await fetch(
      `${API_BASE_URL}/admin/tags/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    );

    if (!response.ok) throw new Error('Failed to search tags');
    return response.json();
  }

  /**
   * Get tag by ID
   */
  async getTagById(id: string): Promise<{ success: boolean; tag: Tag }> {
    const response = await fetch(`${API_BASE_URL}/admin/tags/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch tag');
    return response.json();
  }

  /**
   * Create new tag
   */
  async createTag(name: string): Promise<{ success: boolean; message: string; tag: Tag }> {
    const response = await fetch(`${API_BASE_URL}/admin/tags`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create tag');
    }
    return response.json();
  }

  /**
   * Update tag
   */
  async updateTag(id: string, name: string): Promise<{ success: boolean; message: string; tag: Tag }> {
    const response = await fetch(`${API_BASE_URL}/admin/tags/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update tag');
    }
    return response.json();
  }

  /**
   * Delete tag
   */
  async deleteTag(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/tags/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete tag');
    }
    return response.json();
  }
}

export const tagsApi = new TagsApiService();
