const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface EmailSettings {
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail?: string;
  fromName?: string;
}

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  body: string;        // mapped from htmlContent
  htmlContent: string; // raw from backend
  variables: string[];
  isActive: boolean;
}

// Normalization function to handle _id/id mismatch and htmlContent/body mapping
function normalizeTemplate(raw: any): EmailTemplate {
  if (!raw) return raw;
  const id = raw.id || raw._id;
  const body = raw.body || raw.htmlContent || '';
  return { ...raw, id, body, htmlContent: body, _id: undefined };
}

class EmailSettingsService {
  private getAuthHeaders() {
    let token = null;

    if (typeof window !== "undefined") {
      // Get token from Redux persist
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

    // Fallback to simple localStorage if redux persist fails or not used
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("token");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Settings
  async getSettings() {
    const response = await fetch(
      `${API_BASE_URL}/admin/email-config/settings`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch settings");
    return response.json();
  }

  async updateSettings(settings: EmailSettings) {
    const response = await fetch(
      `${API_BASE_URL}/admin/email-config/settings`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings),
      }
    );
    if (!response.ok) throw new Error("Failed to update settings");
    return response.json();
  }

  async testConnection(settings: EmailSettings, email: string) {
    const response = await fetch(
      `${API_BASE_URL}/admin/email-config/test-connection`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ...settings, testEmail: email }),
      }
    );
    if (!response.ok) throw new Error("Failed to test connection");
    return response.json();
  }

  // Templates
  async getTemplates() {
    const response = await fetch(
      `${API_BASE_URL}/admin/email-config/templates`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch templates");
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeTemplate) : [];
  }

  async getTemplate(id: string) {
    const response = await fetch(
      `${API_BASE_URL}/admin/email-config/templates/${id}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch template");
    const data = await response.json();
    return normalizeTemplate(data);
  }

  async updateTemplate(id: string, data: Partial<EmailTemplate>) {
    const response = await fetch(
      `${API_BASE_URL}/admin/email-config/templates/${id}`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error("Failed to update template");
    const resData = await response.json();
    return normalizeTemplate(resData);
  }

  async sendTestTemplateEmail(id: string, email: string) {
    const response = await fetch(
      `${API_BASE_URL}/admin/email-config/templates/${id}/test`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send test email");
    }
    return response.json();
  }

  async initializeTemplates() {
    const response = await fetch(
      `${API_BASE_URL}/admin/email-config/templates/init`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to initialize templates");
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeTemplate) : [];
  }
}

export const emailSettingsService = new EmailSettingsService();
