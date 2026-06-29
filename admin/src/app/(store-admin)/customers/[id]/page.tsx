"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckMarkIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { customersApi, Customer } from "@/services/customers.api";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = React.useState<Customer | null>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [ordersRestricted, setOrdersRestricted] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch user details first - this is critical for the page
        try {
          const userData = await customersApi.getCustomer(userId);
          setUser(userData);
        } catch (err: any) {
          throw new Error(err.message || "Failed to fetch customer details");
        }

        // Attempt to fetch orders - this might fail if user doesn't have permission
        try {
          const ordersData = await customersApi.getCustomerOrders(userId);
          setOrders(ordersData);
          setOrdersRestricted(false);
        } catch (err: any) {
          // If it's a permission error (likely 403), we just don't show orders
          if (
            err.message &&
            (err.message.includes("permission") ||
              err.message.includes("Forbidden") ||
              err.message.includes("403"))
          ) {
            console.log("User does not have permission to view orders");
            setOrdersRestricted(true);
            setOrders([]);
          } else {
            console.error("Failed to fetch orders:", err);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch customer details");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);
  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    const configs: Record<string, { color: string; dotColor: string }> = {
      pending: { color: "#b45309", dotColor: "#f59e0b" }, // Amber 700 / 500
      confirmed: { color: "#1d4ed8", dotColor: "#3b82f6" }, // Blue 700 / 500
      processing: { color: "#4338ca", dotColor: "#6366f1" }, // Indigo 700 / 500
      ready_to_ship: { color: "#0e7490", dotColor: "#06b6d4" }, // Cyan 700 / 500
      shipped: { color: "#7e22ce", dotColor: "#a855f7" }, // Purple 700 / 500
      out_for_delivery: { color: "#0f766e", dotColor: "#14b8a6" }, // Teal 700 / 500
      delivered: { color: "#15803d", dotColor: "#22c55e" }, // Green 700 / 500
      completed: { color: "#15803d", dotColor: "#22c55e" }, // Green 700 / 500
      cancelled: { color: "#4b5563", dotColor: "#9ca3af" }, // Gray 600 / 400
      failed: { color: "#b91c1c", dotColor: "#ef4444" }, // Red 700 / 500
      return_requested: { color: "#be123c", dotColor: "#f43f5e" }, // Rose 700 / 500
      replacement_requested: { color: "#be185d", dotColor: "#ec4899" }, // Pink 700 / 500
      returned: { color: "#334155", dotColor: "#64748b" }, // Slate 700 / 500
      refunded: { color: "#047857", dotColor: "#10b981" }, // Emerald 700 / 500
      partially_returned: { color: "#c2410c", dotColor: "#f97316" }, // Orange 700 / 500
      partially_replaced: { color: "#c2410c", dotColor: "#f97316" }, // Orange 700 / 500
    };

    const config = configs[s] || { color: "#475569", dotColor: "#94a3b8" };

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: config.dotColor,
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 600,
            color: config.color,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {status.replace(/_/g, " ").toUpperCase()}
          {(s === "delivered" || s === "completed") && (
            <CheckMarkIcon sx={{ fontSize: 14 }} />
          )}
          {s === "failed" && <ErrorIcon sx={{ fontSize: 14 }} />}
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[var(--select-color,#7B3FF2)] animate-spin" />
          </div>
          <span className="text-[13px] font-medium text-slate-400 tracking-wide">
            Loading customer details…
          </span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <ErrorIcon sx={{ fontSize: 24, color: "#ef4444" }} />
          </div>
          <h3 className="text-[15px] font-bold text-red-700 mb-1">
            Something went wrong
          </h3>
          <p className="text-[13px] text-red-500 mb-4">
            {error || "User not found"}
          </p>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{
              textTransform: "none",
              borderRadius: "10px",
              borderColor: "#fca5a5",
              color: "#dc2626",
              fontWeight: 600,
              fontSize: "13px",
              "&:hover": { borderColor: "#f87171", bgcolor: "#fef2f2" },
            }}
          >
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  const customerName = user.name || `${user.firstName} ${user.lastName}`;
  const initials = user.name
    ? user.name[0].toUpperCase()
    : user.firstName
      ? user.firstName[0].toUpperCase()
      : "U";

  return (
    <div className="p-6 space-y-5 font-sans">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: "var(--select-color, #7B3FF2)",
                fontSize: "1.4rem",
                fontWeight: 700,
                boxShadow:
                  "0 8px 20px -4px color-mix(in srgb, var(--select-color, #7B3FF2) 35%, transparent)",
              }}
            >
              {initials}
            </Avatar>
            {user.isActive && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px] font-bold text-slate-800 leading-tight">
              {customerName}
            </h1>
            <p className="text-[13px] text-slate-400 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${user.isActive
                    ? "bg-green-50 text-green-600 border border-green-100"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-slate-400"}`}
                />
                {user.isActive ? "Active" : "Inactive"}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                Customer
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            borderColor: "#e2e8f0",
            color: "#64748b",
            fontWeight: 600,
            fontSize: "13px",
            px: 3,
            py: 1.2,
            alignSelf: "flex-start",
            "&:hover": {
              borderColor: "#cbd5e1",
              bgcolor: "#f8fafc",
            },
          }}
        >
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full">
        {/* ── Customer Info Card ──────────────────────────── */}
        <div className="md:col-span-4">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[var(--select-color,#7B3FF2)] [&_svg]:text-[18px]">
                  <PersonIcon />
                </span>
                <span className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                  Customer Details
                </span>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Phone
                </span>
                <span className="text-[13.5px] text-slate-700 font-medium">
                  {user.phone
                    ? typeof user.phone === "string"
                      ? user.phone
                      : `${user.phone.countryCode} ${user.phone.number}`
                    : "—"}
                </span>
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Role
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[12px] font-semibold border border-blue-100 w-fit">
                  Customer
                </span>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold w-fit ${user.isActive
                      ? "bg-green-50 text-green-600 border border-green-100"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-slate-400"}`}
                  />
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Joined */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Joined
                </span>
                <span className="text-[13.5px] text-slate-700 font-medium">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Addresses Card ──────────────────────────────── */}
        <div className="md:col-span-8">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[var(--select-color,#7B3FF2)] [&_svg]:text-[18px]">
                  <PeopleIcon />
                </span>
                <span className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                  Addresses
                </span>
                {user?.addresses && user.addresses.length > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                    {user.addresses.length}
                  </span>
                )}
              </div>
            </div>
            <div className="p-5">
              {user?.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      className="group relative rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--select-color,#7B3FF2)]/8 text-[var(--select-color,#7B3FF2)] text-[11px] font-bold uppercase tracking-wider">
                            {addr.type || "Saved"}
                          </span>
                          {addr.isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-semibold border border-green-100">
                              <span className="w-1 h-1 rounded-full bg-green-500" />
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[13.5px] font-semibold text-slate-700">
                          {addr.name}
                        </p>
                        {addr.addressLine1 && (
                          <p className="text-[12.5px] text-slate-500 leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </p>
                        )}
                        <p className="text-[12.5px] text-slate-500">
                          {[addr.city, addr.state, addr.pinCode, addr.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {addr.phone && (
                          <p className="text-[12px] text-slate-400 mt-1">
                            Phone: {addr.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <PeopleIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                  </div>
                  <p className="text-[13px] text-slate-400 max-w-xs">
                    No saved addresses found. Addresses are typically captured
                    during checkout or added via profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Past Orders Card ────────────────────────────── */}
        <div className="md:col-span-12">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[var(--select-color,#7B3FF2)] [&_svg]:text-[18px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-[18px] h-[18px]"
                  >
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </span>
                <span className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                  Orders
                </span>
                {!ordersRestricted && orders.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                    {orders.length}
                  </span>
                )}
              </div>
            </div>
            <div>
              <TableContainer sx={{ "& .MuiTableCell-root": { borderColor: "#f1f5f9" } }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#fafbfc" }}>
                      {[
                        "Order #",
                        "Customer",
                        "Type",
                        "Items",
                        "Total",
                        "Payment",
                        "Status",
                        "Date",
                        "Action",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          align={header === "Action" ? "center" : "left"}
                        >
                          <span className="text-[10.5px] uppercase tracking-[0.08em] font-bold text-slate-400">
                            {header}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ordersRestricted ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                              <span className="text-xl">🔒</span>
                            </div>
                            <p className="text-[14px] font-semibold text-slate-500 mb-1">
                              Access Restricted
                            </p>
                            <p className="text-[12.5px] text-slate-400">
                              You do not have permission to view orders.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 10 }}>
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-5 h-5 text-slate-300"
                              >
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 01-8 0" />
                              </svg>
                            </div>
                            <p className="text-[13px] text-slate-400">
                              No orders found
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow
                          key={order.id}
                          hover
                          sx={{
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                            "&:hover": {
                              bgcolor: "#f8fafc",
                            },
                          }}
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <span className="text-[13px] font-semibold text-[var(--select-color,#7B3FF2)] hover:underline">
                              {order.orderNumber}
                            </span>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-slate-700">
                                {user.name ||
                                  `${user.firstName} ${user.lastName}`}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {user.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${order.orderType === "quote_request"
                                  ? "bg-purple-50 text-purple-600 border-purple-100"
                                  : order.orderType === "direct_purchase"
                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                }`}
                            >
                              {order.orderType === "quote_request"
                                ? "Quote"
                                : order.orderType === "direct_purchase"
                                  ? "Purchase"
                                  : "Invoice"}
                            </span>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <span className="text-[13px] text-slate-600">
                              {order.items.length} items
                            </span>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <span className="text-[13px] font-semibold text-slate-800">
                              ₹{order.pricing?.total?.toFixed(2) || "0.00"}
                            </span>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {order.paymentSummary ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-semibold">
                                  <span className="w-1 h-1 rounded-full bg-green-500" />
                                  Paid: ₹
                                  {order.paymentSummary.paidAmount.toFixed(2)}
                                </span>
                                {order.paymentSummary.pendingAmount > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-orange-500 font-semibold">
                                    <span className="w-1 h-1 rounded-full bg-orange-400" />
                                    Due: ₹
                                    {order.paymentSummary.pendingAmount.toFixed(
                                      2
                                    )}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-300">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            {renderStatusBadge(order.status)}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <div className="flex flex-col">
                              <span className="text-[12.5px] text-slate-600 font-medium">
                                {new Date(
                                  order.createdAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-[10.5px] text-slate-400">
                                {new Date(order.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Tooltip title="View Details" arrow>
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/orders/${order.id}`);
                                }}
                                size="small"
                                sx={{
                                  color: "#94a3b8",
                                  transition: "all 0.15s ease",
                                  "&:hover": {
                                    color: "var(--select-color, #7B3FF2)",
                                    bgcolor:
                                      "var(--select-color, #7B3FF2)10",
                                  },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
