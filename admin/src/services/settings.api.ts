import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface SEOSettings {
  siteName: string;
  siteDescription: string;
  keywords: string[];
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  metaImage?: string;
}

export interface CustomScripts {
  headerScripts?: string;
  footerScripts?: string;
}

export interface SEOSettingsResponse {
  seo: SEOSettings;
  customScripts: CustomScripts;
  siteName?: string;
  siteDescription?: string;
}

export const settingsApi = {
  // Get all settings
  getSettings: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/admin/settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update settings
  updateSettings: async (data: any) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${API_URL}/admin/settings`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get SEO settings
  getSEOSettings: async (): Promise<SEOSettingsResponse> => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/admin/settings/seo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update SEO settings
  updateSEOSettings: async (data: {
    seo?: SEOSettings;
    customScripts?: CustomScripts;
  }) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/admin/settings/seo`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get store domains
  getDomains: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/admin/settings/domains`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Add custom domain
  addDomain: async (domain: string) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/admin/settings/domains`,
      { domain },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};
