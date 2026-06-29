import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface Page {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  isPublished: boolean;
  template?: string;
  viewCount?: number;
  showInHeader?: boolean;
  showInFooter?: boolean;
  sortOrder?: number;
  is_homepage?: boolean;
  content?: string;
  storeId?: string;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  metaKeywords?: string[];

  // Dynamic Sections
  sections?: Array<{
    section: any;
    isEnabled: boolean;
    sortOrder: number;
    customData?: any;
    id?: string;
    clientId?: string;
    dndId?: string;
    type?: string;
  }>;

  // Legacy Service Sections (Migration)
  legacyServiceSections?: Array<{
    id: string;
    type: string;
    isEnabled: boolean;
    data: any;
  }>;

  // Legacy Static Fields (Migration)
  legacyStaticSections?: any;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePageDto extends Partial<Page> {
  title: string;
  slug?: string;
}

/** Backend returns `id` (TypeORM UUID), frontend expects `_id`. Normalise here. */
function normalizePage(raw: any): Page {
  if (!raw) return raw;
  // Handle backend wrapper { success: true, data: Page }
  const page = raw.data || raw;
  const id = page.id || page._id;
  return { ...page, id, _id: id };
}

function normalizePages(raw: any): Page[] {
  const arr = Array.isArray(raw) ? raw : raw?.data || raw?.pages || [];
  return arr.map(normalizePage);
}

export const pagesApi = {
  getAllPages: async (): Promise<Page[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/admin/pages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizePages(response.data);
  },

  getPages: async (params?: {
    search?: string;
    limit?: number;
    page?: number;
    isPublished?: boolean;
  }): Promise<Page[]> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/admin/pages`, {
      headers: { Authorization: `Bearer ${token}` },
      params: params,
    });
    return normalizePages(response.data);
  },

  getPageById: async (id: string): Promise<{ page: Page }> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/admin/pages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { page: normalizePage(response.data) };
  },

  getPageBySlug: async (slug: string): Promise<{ page: Page }> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/admin/pages/slug/${slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { page: normalizePage(response.data) };
  },

  createPage: async (data: Partial<Page>): Promise<{ page: Page }> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/admin/pages`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { page: normalizePage(response.data) };
  },

  updatePage: async (
    id: string,
    data: Partial<Page>
  ): Promise<{ page: Page }> => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/admin/pages/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { page: normalizePage(response.data) };
  },

  deletePage: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/admin/pages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  publishPage: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${API_URL}/admin/pages/${id}`,
      { isPublished: true },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  unpublishPage: async (id: string): Promise<void> => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${API_URL}/admin/pages/${id}`,
      { isPublished: false },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  duplicatePage: async (id: string): Promise<{ page: Page }> => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/admin/pages/${id}/duplicate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { page: response.data };
  },
};
