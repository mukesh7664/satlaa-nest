import { fetchWithAuth } from "@/utils/apiUtils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

export interface Notification {
  _id: string;
  type: "order" | "inquiry" | string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  priority: "urgent" | "high" | "medium" | "low";
  createdAt: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class NotificationsApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get all notifications for current admin
   */
  async getNotifications(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<GetNotificationsResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await fetchWithAuth(
      `${this.baseUrl}/admin/notifications?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch notifications");
    }

    return response.json();
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/admin/notifications/unread-count`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch unread count");
    }

    const result = await response.json();
    return result.data?.count ?? 0;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/admin/notifications/${id}/read`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to mark notification as read");
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/admin/notifications/mark-all-read`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to mark all as read");
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    const response = await fetchWithAuth(
      `${this.baseUrl}/admin/notifications/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete notification");
    }
  }
}

export const notificationsApi = new NotificationsApiService();
