const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export interface IAuditLog {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  userEmail: string;
  userRole: string;
  action: string;
  actionDescription: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  changes?: {
    before?: any;
    after?: any;
    fields?: string[];
  };
  ipAddress?: string;
  userAgent?: string;
  status: string;
  errorMessage?: string;
  createdAt: string;
}

export interface IGetLogsParams {
  page?: number;
  limit?: number;
  adminId?: string;
  action?: string;
  resourceType?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

class AuditLogsApiService {
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

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async getLogs(params: IGetLogsParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.adminId) queryParams.append("adminId", params.adminId);
    if (params.action) queryParams.append("action", params.action);
    if (params.resourceType)
      queryParams.append("resourceType", params.resourceType);
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const response = await fetch(
      `${API_BASE_URL}/admin/audit-logs?${queryParams}`,
      { headers: this.getAuthHeaders() }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch audit logs");
    }
    return response.json();
  }
}

export const auditLogsApi = new AuditLogsApiService();
