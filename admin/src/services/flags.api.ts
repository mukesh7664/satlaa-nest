const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003';

export interface Flag {
  id: string;
  _id: string;
  name: string;
  slug: string;
  color?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

class FlagsApiService {
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
   * Get all flags
   */
  async getAllFlags(params?: { search?: string }): Promise<{ success: boolean; count: number; flags: Flag[] }> {
    const queryParams = new URLSearchParams();
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const response = await fetch(`${API_BASE_URL}/admin/flags?${queryParams.toString()}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch flags');
    return response.json();
  }

  /**
   * Search flags (for autocomplete)
   */
  async searchFlags(query: string, limit: number = 10): Promise<{ success: boolean; count: number; flags: Flag[] }> {
    const response = await fetch(
      `${API_BASE_URL}/admin/flags/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      { headers: this.getAuthHeaders() }
    );

    if (!response.ok) throw new Error('Failed to search flags');
    return response.json();
  }

  /**
   * Get flag by ID
   */
  async getFlagById(id: string): Promise<{ success: boolean; flag: Flag }> {
    const response = await fetch(`${API_BASE_URL}/admin/flags/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch flag');
    return response.json();
  }

  /**
   * Create new flag
   */
  async createFlag(name: string, color?: string): Promise<{ success: boolean; message: string; flag: Flag }> {
    const response = await fetch(`${API_BASE_URL}/admin/flags`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, color }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create flag');
    }
    return response.json();
  }

  /**
   * Update flag
   */
  async updateFlag(id: string, name: string, color?: string): Promise<{ success: boolean; message: string; flag: Flag }> {
    const response = await fetch(`${API_BASE_URL}/admin/flags/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, color }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update flag');
    }
    return response.json();
  }

  /**
   * Delete flag
   */
  async deleteFlag(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/flags/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete flag');
    }
    return response.json();
  }
}

export const flagsApi = new FlagsApiService();
