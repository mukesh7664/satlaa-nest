import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

export interface ISectionType {
  id: string;
  _id?: string;
  name: string;
  type: string;

  thumbnail?: string;
  data?: any;
  tags?: string[];
  isActive?: boolean;
  category?: 'header' | 'footer' | 'section' | 'cart' | 'checkout' | 'product';
  scope?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSectionTypeData {
  name: string;
  type: string;

  data?: any;
  tags?: string[];
  isActive?: boolean;
  category?: 'header' | 'footer' | 'section' | 'cart' | 'checkout' | 'product';
  thumbnail?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const sectionApi = {
  getAll: async (params?: {
    search?: string;
    tags?: string;
    includeInactive?: boolean;
    type?: string;
    category?: string;
    scope?: string;
    exact?: boolean;
    storeId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await axios.get<{
      data: ISectionType[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${API_BASE_URL}/section-types`, { params });
    return response.data;
  },

  getTags: async () => {
    const response = await axios.get<string[]>(
      `${API_BASE_URL}/section-types/tags`,
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axios.get<ISectionType>(
      `${API_BASE_URL}/section-types/${id}`
    );
    return response.data;
  },

  create: async (data: CreateSectionTypeData) => {
    const response = await axios.post<ISectionType>(
      `${API_BASE_URL}/admin/section-types`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  update: async (id: string, data: Partial<CreateSectionTypeData>) => {
    const response = await axios.put<ISectionType>(
      `${API_BASE_URL}/admin/section-types/${id}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`${API_BASE_URL}/admin/section-types/${id}`, {
      headers: getAuthHeaders(),
    });
  },
};
