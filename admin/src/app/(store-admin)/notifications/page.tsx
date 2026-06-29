"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  ShoppingCart as OrderIcon,
  QuestionAnswer as InquiryIcon,
  Info as SystemIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { notificationsApi, Notification } from "@/services/notifications.api";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(15);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications({
        page: page,
        limit: rowsPerPage,
      });
      setNotifications(response.data);
      setTotal(response.pagination.total);
    } catch (err: any) {
      console.error("Failed to fetch notifications", err);
      toast.error(err.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (err: any) {
      console.error("Failed to mark all as read", err);
      toast.error(err.message || "Failed to mark all as read");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      toast.success("Notification marked as read");
      // Update local state to show it is read
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err: any) {
      console.error("Failed to mark notification as read", err);
      toast.error(err.message || "Failed to mark notification as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
      toast.success("Notification deleted successfully");
      fetchNotifications();
    } catch (err: any) {
      console.error("Failed to delete notification", err);
      toast.error(err.message || "Failed to delete notification");
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationsApi.markAsRead(notification._id);
      } catch (err) {
        console.error("Failed to mark as read during click", err);
      }
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <OrderIcon className="text-blue-500" />;
      case "inquiry":
        return <InquiryIcon className="text-green-500" />;
      default:
        return <SystemIcon className="text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-50 text-red-700 border-red-100";
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "medium":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-4 font-sans">
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with recent orders, product inquiries, and system notifications.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outlined"
            onClick={handleMarkAllAsRead}
            startIcon={<CheckCircleIcon />}
            size="medium"
            sx={{
              color: "var(--primary)",
              borderColor: "var(--primary)",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                bgcolor: "var(--primary-foreground)",
                borderColor: "var(--primary)",
              },
            }}
          >
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <CircularProgress />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-400">
          <NotificationsIcon className="w-16 h-16 mb-3 opacity-30" />
          <h3 className="text-base font-semibold text-slate-700">No Notifications</h3>
          <p className="text-sm text-slate-500 mt-1">Everything looks clear for now!</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <TableContainer sx={{ boxShadow: "none", bgcolor: "transparent" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    <TableCell width="60" align="center">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Status
                      </span>
                    </TableCell>
                    <TableCell width="60" align="center">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Type
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Notification Details
                      </span>
                    </TableCell>
                    <TableCell width="120" align="center">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Priority
                      </span>
                    </TableCell>
                    <TableCell width="150" align="center">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Time
                      </span>
                    </TableCell>
                    <TableCell width="150" align="center">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Actions
                      </span>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow
                      key={notification._id}
                      hover
                      sx={{
                        cursor: "pointer",
                        bgcolor: !notification.isRead ? "rgba(59, 130, 246, 0.02)" : "inherit",
                        "&:hover": {
                          bgcolor: !notification.isRead
                            ? "rgba(59, 130, 246, 0.04) !important"
                            : "rgba(0, 0, 0, 0.02) !important",
                        },
                      }}
                    >
                      <TableCell align="center" onClick={() => handleNotificationClick(notification)}>
                        {!notification.isRead ? (
                          <Tooltip title="Unread">
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block shadow-sm animate-pulse"></span>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Read">
                            <span className="w-2.5 h-2.5 bg-slate-300 rounded-full inline-block"></span>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align="center" onClick={() => handleNotificationClick(notification)}>
                        {getNotificationIcon(notification.type)}
                      </TableCell>
                      <TableCell onClick={() => handleNotificationClick(notification)}>
                        <div className="space-y-0.5">
                          <p
                            className={`text-sm ${
                              !notification.isRead ? "font-semibold text-slate-900" : "text-slate-600"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell align="center" onClick={() => handleNotificationClick(notification)}>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                            notification.priority
                          )}`}
                        >
                          {notification.priority || "medium"}
                        </span>
                      </TableCell>
                      <TableCell align="center" onClick={() => handleNotificationClick(notification)}>
                        <span className="text-xs text-slate-500">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex justify-center items-center gap-1">
                          {!notification.isRead && (
                            <Tooltip title="Mark as read">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification._id);
                                }}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {notification.actionUrl && (
                            <Tooltip title="View target page">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNotificationClick(notification);
                                }}
                                className="text-emerald-600 hover:bg-emerald-50"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification._id);
                              }}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination footer */}
            {total > rowsPerPage && (
              <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-[#f8f9fa]">
                <p className="text-xs text-slate-500">
                  Showing {Math.min(total, (page - 1) * rowsPerPage + 1)} to{" "}
                  {Math.min(total, page * rowsPerPage)} of {total} notifications
                </p>
                <Pagination
                  count={Math.ceil(total / rowsPerPage)}
                  page={page}
                  onChange={(_, val) => setPage(val)}
                  size="small"
                  color="primary"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
