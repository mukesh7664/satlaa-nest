const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  storeName?: string;
}

export interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: any;
  isActive: boolean;
  trial_days: number;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ApiError {
  message: string;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      
      // Redirect to login page if window is available
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      const error: ApiError = await response.json();
      throw new Error(error.message || "Session expired. Please login again.");
    }
    return response;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  }

  async getCurrentAdmin(
    token: string
  ): Promise<{ admin: LoginResponse["admin"] }> {
    const response = await fetch(`${this.baseUrl}/admin/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "Failed to fetch admin details");
    }

    return response.json();
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  }

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const response = await fetch(`${this.baseUrl}/admin/check-email?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "Failed to check email");
    }

    return response.json();
  }

  async getPlans(activeOnly?: boolean): Promise<Plan[]> {
    let url = `${this.baseUrl}/plans`;
    const params = new URLSearchParams();
    if (activeOnly) params.append('isActive', 'true');

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "Failed to fetch plans");
    }

    return response.json();
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "Password reset request failed");
    }

    return response.json();
  }

  async verifyOtp(data: VerifyOtpData): Promise<{ message: string; resetToken: string }> {
    const response = await fetch(`${this.baseUrl}/admin/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "OTP verification failed");
    }

    return response.json();
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/admin/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "Password reset failed");
    }

    return response.json();
  }

  async getSaaSSummary(token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/admin/dashboard/saas-summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "Failed to fetch SaaS summary");
    }

    return response.json();
  }

  // Generic methods
  async get(endpoint: string, options?: { params?: Record<string, any> }): Promise<any> {
    const token = localStorage.getItem('token');
    let url = `${this.baseUrl}${endpoint}`;

    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    const response = await this.handleResponse(await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }));

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `GET ${endpoint} failed`;
      try {
        if (errorText) {
          const error: ApiError = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        }
      } catch (e) {
        // ignore parse error if any
      }
      throw new Error(errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async post(endpoint: string, data: any): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await this.handleResponse(await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }));

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `POST ${endpoint} failed`;
      try {
        if (errorText) {
          const error: ApiError = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        }
      } catch (e) {
        // ignore parse error if any
      }
      throw new Error(errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async put(endpoint: string, data: any): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await this.handleResponse(await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }));

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `PUT ${endpoint} failed`;
      try {
        if (errorText) {
          const error: ApiError = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        }
      } catch (e) {
        // ignore parse error if any
      }
      throw new Error(errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async patch(endpoint: string, data?: any): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await this.handleResponse(await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    }));

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `PATCH ${endpoint} failed`;
      try {
        if (errorText) {
          const error: ApiError = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        }
      } catch (e) {
        // ignore parse error if any
      }
      throw new Error(errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async delete(endpoint: string): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await this.handleResponse(await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }));

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `DELETE ${endpoint} failed`;
      try {
        if (errorText) {
          const error: ApiError = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        }
      } catch (e) {
        // ignore parse error if any
      }
      throw new Error(errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }
}

export const apiService = new ApiService();
