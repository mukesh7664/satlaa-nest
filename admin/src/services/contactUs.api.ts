const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface ContactUsSettings {
  id?: string;
  addressSection: {
    show: boolean;
    title?: string;
    description?: string;
    officeAddress?: string;
    email?: string;
    phone?: string;
    mapUrl?: string;
  };
  contactFormSection: {
    show: boolean;
    title?: string;
    subtitle?: string;
    image?: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

class ContactUsApiService {
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

  async getContactUsSettings(): Promise<ContactUsSettings> {
    const response = await fetch(`${API_BASE_URL}/admin/contact-us`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch Contact Us settings");
    return response.json();
  }

  async updateContactUsSettings(data: Partial<ContactUsSettings>) {
    const response = await fetch(`${API_BASE_URL}/admin/contact-us`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update Contact Us settings");
    }
    return response.json();
  }
}

export const contactUsApi = new ContactUsApiService();
