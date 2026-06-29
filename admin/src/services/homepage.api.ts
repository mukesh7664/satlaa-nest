const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface HomepageSettings {
  id?: string;
  heroSection: {
    show: boolean;
    title?: string;
    subtitle?: string;
    image?: string;
    content?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  topCategories: {
    show: boolean;
    title?: string;
    subtitle?: string;
    items?: Array<{
      title?: string;
      slug?: string;
      image?: string;
    }>;
  };
  topSelling: {
    show: boolean;
    title?: string;
    subtitle?: string;
    items: Array<{
      title?: string;
      slug?: string;
      image?: string;
      placeholder?: boolean;
      bgColor?: string;
    }>;
  };
  topTrending: {
    show: boolean;
    title?: string;
    subtitle?: string;
    collectionSlug?: string;
  };
  bannerSection: {
    show: boolean;
    title?: string;
    image?: string;
    content?: string;
    link?: string;
  };
  dualBannerSection: {
    show: boolean;
    banner1: {
      image?: string;
      link?: string;
    };
    banner2: {
      image?: string;
      link?: string;
    };
  };
  softwareFor: {
    show: boolean;
    title?: string;
    subtitle?: string;
    collectionSlug?: string;
  };
  reviews: {
    show: boolean;
    title?: string;
    subtitle?: string;
    image?: string;
    buttonText?: string;
    buttonLink?: string;
  };
  testimonials: {
    show: boolean;
    title?: string;
    subtitle?: string;
    items: Array<{
      name?: string;
      role?: string;
      review?: string;
      image?: string;
      rating?: number;
    }>;
  };
  trustedBrands: {
    show: boolean;
    title?: string;
    subtitle?: string;
    images: string[];
    buttonText?: string;
    buttonLink?: string;
  };
  articles: {
    show: boolean;
    title?: string;
    subtitle?: string;
  };
  empowering: {
    show: boolean;
    title?: string;
    subtitle?: string;
    image?: string;
    content?: string;
    button1Text?: string;
    button1Link?: string;
    button2Text?: string;
    button2Link?: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  sections?: Array<{
    id: string;
    type: string;
    isEnabled: boolean;
    data: any;
  }>;
  pageSections?: Array<{
    section: any;
    isEnabled: boolean;
    sortOrder: number;
    customData?: any;
    id?: string;
  }>;
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

class HomepageApiService {
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getHomepageSettings(): Promise<HomepageSettings> {
    const response = await fetch(`${API_BASE_URL}/admin/homepage`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch Homepage settings");
    return response.json();
  }

  async updateHomepageSettings(data: Partial<HomepageSettings>) {
    const response = await fetch(`${API_BASE_URL}/admin/homepage`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update Homepage settings");
    }
    return response.json();
  }
}

export const homepageApi = new HomepageApiService();
