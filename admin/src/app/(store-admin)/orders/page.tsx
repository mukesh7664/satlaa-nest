"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/currencyUtils";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Popover,
} from "@mui/material";
import { Calendar, ChevronDown, ChevronUp, X } from "lucide-react";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Sort as SortIcon,
  Add as AddIcon,
  CheckCircle as CheckMarkIcon,
  Error as ErrorIcon,
  LocalShipping as ShippingIcon,
  Cancel as CancelIcon,
  Settings as ProcessingIcon,
  Payment as PaymentIcon,
  Assignment as TotalIcon,
  AssignmentReturn as ReturnIcon,
  ReportProblem as FailedIcon,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  shipment?: {
    id: number;
    shipmentId: string;
    awbCode: string;
    status: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  guestEmail?: string;
  items: any[];
  pricing: {
    total: number;
  };
  currency: string;
  paymentSummary?: {
    paidAmount: number;
    rejectedAmount: number;
    pendingAmount: number;
    paidItemsCount: number;
    rejectedItemsCount: number;
    pendingItemsCount: number;
  };
  createdAt: string;
}

interface OrderStats {
  totalOrders: number;
  needInvoice: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  shipped: number;
  returned: number;
  failed: number;
  return_requested?: number;
  replacement_requested?: number;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { admin } = useAppSelector((state) => state.auth);
  const canEdit =
    admin?.role === "super_admin" ||
    admin?.role === "admin" ||
    admin?.role === "store_admin" ||
    admin?.permissions?.includes("*") ||
    admin?.permissions?.includes("orders.edit");

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profit Margin Chart State
  const [profitTab, setProfitTab] = useState("12 months");
  const [profitMarginData, setProfitMarginData] = useState<any[]>([]);
  const [profitLoading, setProfitLoading] = useState(false);

  const fetchProfitMargin = async (range: string) => {
    try {
      setProfitLoading(true);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        `${apiUrl}/admin/orders/profit-margin?range=${encodeURIComponent(range)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfitMarginData(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching profit margin stats:", err);
    } finally {
      setProfitLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitMargin(profitTab);
  }, [profitTab]);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  // Date Filters
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Popover Anchor & Temp Dates State
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const isPopoverOpen = Boolean(anchorEl);
  const popoverId = isPopoverOpen ? "date-range-popover" : undefined;

  const getPresetLabel = (preset: string) => {
    switch (preset) {
      case "all": return "All Time";
      case "today": return "Today";
      case "yesterday": return "Yesterday";
      case "week": return "Last Week";
      case "month": return "Last Month";
      case "year": return "Last Year";
      case "custom": return "Custom Range";
      default: return preset;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  // Sort State
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [
    page,
    search,
    statusFilter,
    paymentStatusFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case "all":
        setStartDate("");
        setEndDate("");
        setTempStartDate("");
        setTempEndDate("");
        setPage(1);
        return;
      case "today":
        start = today;
        end = today;
        break;
      case "yesterday":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case "week":
        start.setDate(today.getDate() - 7);
        end = today;
        break;
      case "month":
        start.setMonth(today.getMonth() - 1);
        end = today;
        break;
      case "year":
        start.setFullYear(today.getFullYear() - 1);
        end = today;
        break;
      case "custom":
        return;
      default:
        break;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setPage(1);
  };

  const fetchStats = async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(`${apiUrl}/admin/orders/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to view orders");
      }

      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sortBy,
        order: sortOrder,
      });

      if (search) params.append("search", search);
      if (statusFilter && statusFilter !== "all")
        params.append("status", statusFilter);
      if (paymentStatusFilter && paymentStatusFilter !== "all")
        params.append("paymentStatus", paymentStatusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(
        `${apiUrl}/admin/orders?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const baseStatus = status.split(":").pop()?.trim().toLowerCase() || "";
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
      approved: { color: "#1d4ed8", dotColor: "#3b82f6" }, // Blue 700 / 500
      picked_up: { color: "#7e22ce", dotColor: "#a855f7" }, // Purple 700 / 500
      qc_passed: { color: "#0e7490", dotColor: "#06b6d4" }, // Cyan 700 / 500
      rejected: { color: "#b91c1c", dotColor: "#ef4444" }, // Red 700 / 500
    };

    const config = configs[baseStatus] || { color: "#475569", dotColor: "#94a3b8" };
    const isDelivered = baseStatus === "delivered" || baseStatus === "completed" || baseStatus === "returned" || baseStatus === "refunded";
    const isFailed = baseStatus === "failed" || baseStatus === "cancelled" || baseStatus === "rejected";

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Box
          sx={{
            width: { xs: 6, '2xl': 8 },
            height: { xs: 6, '2xl': 8 },
            borderRadius: "50%",
            bgcolor: config.dotColor,
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: { xs: "10px", '2xl': "12px" },
            fontWeight: 600,
            color: config.color,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {status.replace(/_/g, " ").toUpperCase()}
          {isDelivered && (
            <CheckMarkIcon sx={{ fontSize: { xs: 12, '2xl': 14 } }} />
          )}
          {isFailed && <ErrorIcon sx={{ fontSize: { xs: 12, '2xl': 14 } }} />}
        </Typography>
      </Box>
    );
  };


  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPaymentStatusFilter("");
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
    setTempStartDate("");
    setTempEndDate("");
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  // Numerical Animation Component
  const CountUp = ({ end, duration = 500 }: { end: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }, [end, duration]);

    return <>{count.toLocaleString()}</>;
  };

  // New Stat Card Component with Animation & Improved Style
  const StatCard = ({ title, value, icon: Icon, color, iconColor }: any) => (
    <div className={`bg-white px-2 2xl:px-4 py-1.5 2xl:py-3.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 2xl:gap-4 transition-all hover:shadow-md hover:-translate-y-0.5 h-[52px] 2xl:h-[80px] group`}>
      <div className={`p-1.5 2xl:p-2.5 rounded-lg ${color} flex-shrink-0 transition-transform group-hover:scale-110`}>
        <Icon className={iconColor} sx={{ fontSize: { xs: 16, '2xl': 24 } }} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[8px] 2xl:text-[11px] font-bold text-slate-400 uppercase tracking-tight truncate leading-none mb-0.5 2xl:mb-1.5">
          {title}
        </span>
        <span className="text-sm 2xl:text-2xl font-black text-slate-800 leading-none">
          <CountUp end={value} />
        </span>
      </div>
    </div>
  );

  const StatCardSkeleton = () => (
    <div className="bg-white px-3 py-2.5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 h-[65px] animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0" />
      <div className="flex flex-col gap-2 w-full">
        <div className="h-2 w-16 bg-slate-50 rounded" />
        <div className="h-4 w-10 bg-slate-50 rounded" />
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="space-y-0.5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-6 p-4 bg-white border-b border-slate-50 animate-pulse">
          <div className="h-4 w-24 bg-slate-50 rounded" />
          <div className="h-4 w-32 bg-slate-50 rounded" />
          <div className="h-4 w-20 bg-slate-50 rounded" />
          <div className="h-4 w-20 bg-slate-50 rounded" />
          <div className="h-4 w-full bg-slate-50 rounded" />
        </div>
      ))}
    </div>
  );

  // Profit Margin Data is now retrieved dynamically from state hooks

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-500">{entry.name}:</span>
              <span className="font-bold text-slate-800">₹{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track your orders
          </p>
        </div>
        {canEdit && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => router.push("/orders/create")}
            sx={{
              bgcolor: "var(--primary)",
              "&:hover": {
                bgcolor: "var(--primary)",
                filter: "brightness(0.9)",
              },
              textTransform: "none",
              borderRadius: "8px",
              px: { xs: 2, '2xl': 3 },
              py: { xs: 0.5, '2xl': 1 },
              fontSize: { xs: "12px", '2xl': "14px" },
            }}
          >
            Create Order
          </Button>
        )}
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 2xl:gap-5 min-h-[52px] 2xl:min-h-[70px]">
        <StatCard title="Total Order" value={stats?.totalOrders || 0} icon={TotalIcon} color="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Pending" value={stats?.needInvoice || 0} icon={PaymentIcon} color="bg-amber-50" iconColor="text-amber-600" />
        <StatCard title="Processing" value={stats?.processing || 0} icon={ProcessingIcon} color="bg-teal-50" iconColor="text-teal-600" />
        <StatCard title="Shipped" value={stats?.shipped || 0} icon={ShippingIcon} color="bg-orange-50" iconColor="text-orange-600" />
        <StatCard title="Delivered" value={stats?.completed || 0} icon={CheckMarkIcon} color="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard title="Cancel" value={stats?.cancelled || 0} icon={CancelIcon} color="bg-rose-50" iconColor="text-rose-600" />
        <StatCard title="Returned" value={stats?.returned || 0} icon={ReturnIcon} color="bg-indigo-50" iconColor="text-indigo-600" />
        <StatCard title="Failed" value={stats?.failed || 0} icon={FailedIcon} color="bg-slate-50" iconColor="text-slate-600" />
      </div>

      {/* Profit Margin Chart Section */}
      <div className="bg-white p-4 2xl:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 2xl:mb-6 gap-4">
          <div>
            <h2 className="text-base 2xl:text-lg font-bold text-slate-800 leading-none">Profit margin</h2>
          </div>
          <div className="flex items-center bg-slate-50 p-1 rounded-lg">
            {['12 months', '30 days', '7 days', '24 hours'].map((tab) => (
              <button
                key={tab}
                onClick={() => setProfitTab(tab)}
                className={`px-3 2xl:px-4 py-1.5 text-[10px] 2xl:text-xs font-bold rounded-md transition-all ${tab === profitTab ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[220px] 2xl:h-[300px] w-full flex items-center justify-center">
          {profitLoading ? (
            <CircularProgress sx={{ color: '#0D9488' }} />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitMarginData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  name="Earnings"
                  stroke="#0D9488"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEarnings)"
                  dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="profits"
                  name="Total Profits"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorProfits)"
                  dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="flex justify-end gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0D9488]"></div>
            <span className="text-xs font-bold text-slate-500">Earnings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
            <span className="text-xs font-bold text-slate-500">Total Profits</span>
          </div>
        </div>
      </div>

      {/* Filters & Search - Consolidated Layout */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search TextField */}
          <TextField
            placeholder="Search orders..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-slate-400" sx={{ fontSize: { xs: 16, '2xl': 18 } }} />
                </InputAdornment>
              ),
              sx: { height: { xs: 32, '2xl': 40 }, fontSize: { xs: 12, '2xl': 14 } }
            }}
            sx={{
              width: { xs: "100%", md: 200, '2xl': 240 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#f8fafc",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
              },
            }}
          />

          {/* Period Filter (Custom Popover) */}
          <div className="relative flex items-center">
            <button
              onClick={handleOpenPopover}
              className={`flex items-center justify-between gap-2 pl-3 ${
                datePreset !== "all" ? "pr-8" : "pr-3"
              } bg-white border border-slate-200 rounded-[8px] hover:border-slate-300 transition-all shadow-sm focus:outline-none select-none h-[32px] min-w-[130px] text-xs font-medium text-slate-600 cursor-pointer`}
            >
              <span>
                {datePreset === "all"
                  ? "Select Period"
                  : datePreset === "custom"
                  ? `${startDate ? formatDate(startDate) : "dd-mm-yyyy"} to ${endDate ? formatDate(endDate) : "dd-mm-yyyy"}`
                  : getPresetLabel(datePreset)}
              </span>
              {datePreset === "all" && (
                isPopoverOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {datePreset !== "all" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDatePresetChange("all");
                }}
                className="absolute right-2.5 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <Popover
              id={popoverId}
              open={isPopoverOpen}
              anchorEl={anchorEl}
              onClose={handleClosePopover}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #f1f5f9",
                  }
                }
              }}
            >
              <div className="flex bg-white overflow-hidden max-w-[480px]">
                {/* Left Column: PRESETS */}
                <div className="p-4 w-[160px] flex flex-col gap-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                    Presets
                  </div>
                  {[
                    { value: "today", label: "Today" },
                    { value: "yesterday", label: "Yesterday" },
                    { value: "week", label: "Last Week" },
                    { value: "month", label: "Last Month" },
                    { value: "year", label: "Last Year" },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        handleDatePresetChange(preset.value);
                        handleClosePopover();
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        datePreset === preset.value
                          ? "bg-slate-50 text-blue-600 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] bg-slate-100 self-stretch" />

                {/* Right Column: CUSTOM RANGE */}
                <div className="p-4 w-[240px] flex flex-col gap-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Custom Range
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      From
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      To
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setStartDate(tempStartDate);
                      setEndDate(tempEndDate);
                      setDatePreset("custom");
                      setPage(1);
                      handleClosePopover();
                    }}
                    disabled={!tempStartDate || !tempEndDate}
                    className="mt-2 w-full py-2 bg-[#1e293b] hover:bg-[#0f172a] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </Popover>
          </div>

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: { xs: 110, '2xl': 130 } }}>
            <InputLabel sx={{ fontSize: { xs: 12, '2xl': 14 } }}>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              label="Status"
              sx={{ borderRadius: "8px", height: { xs: 32, '2xl': 40 }, fontSize: { xs: 12, '2xl': 14 } }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="ready_to_ship">Ready to Ship</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="return_requested">Return Requested</MenuItem>
              <MenuItem value="replacement_requested">Replacement Requested</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="returned">Returned</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>

          {/* Payment Status Filter */}
          <FormControl size="small" sx={{ minWidth: { xs: 130, '2xl': 150 } }}>
            <InputLabel sx={{ fontSize: { xs: 12, '2xl': 14 } }}>Payment Status</InputLabel>
            <Select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              label="Payment Status"
              sx={{ borderRadius: "8px", height: { xs: 32, '2xl': 40 }, fontSize: { xs: 12, '2xl': 14 } }}
            >
              <MenuItem value="">All Payments</MenuItem>
              <MenuItem value="paid">Paid / Success</MenuItem>
              <MenuItem value="unpaid">Unpaid</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>

          <div className="flex-grow hidden md:block" />

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <SortIcon className="text-slate-400" sx={{ fontSize: { xs: 16, '2xl': 18 } }} />
            <FormControl size="small" sx={{ minWidth: { xs: 140, '2xl': 160 } }}>
              <InputLabel sx={{ fontSize: { xs: 12, '2xl': 14 } }}>Sort By</InputLabel>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = (
                    e.target.value as string
                  ).split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as "asc" | "desc");
                  setPage(1);
                }}
                label="Sort By"
                sx={{ borderRadius: "8px", height: { xs: 32, '2xl': 40 }, fontSize: { xs: 12, '2xl': 14 } }}
              >
                <MenuItem value="createdAt-desc">Newest First</MenuItem>
                <MenuItem value="createdAt-asc">Oldest First</MenuItem>
                <MenuItem value="pricing.total-desc">
                  Amount (High-Low)
                </MenuItem>
                <MenuItem value="pricing.total-asc">Amount (Low-High)</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Active Filters Chips */}
        {(datePreset !== "all" || statusFilter || paymentStatusFilter) && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {datePreset !== "all" && (
              <Chip
                label={`Date: ${datePreset === "custom"
                  ? `${startDate ? formatDate(startDate) : ""} to ${endDate ? formatDate(endDate) : ""}`
                  : getPresetLabel(datePreset)
                  }`}
                onDelete={() => handleDatePresetChange("all")}
                size="small"
                sx={{ bgcolor: "#e2e8f0" }}
              />
            )}
            {statusFilter && (
              <Chip
                label={`Status: ${statusFilter.replace(/_/g, " ")}`}
                onDelete={() => setStatusFilter("")}
                size="small"
                sx={{ bgcolor: "#e2e8f0" }}
              />
            )}
            {paymentStatusFilter && (
              <Chip
                label={`Payment: ${paymentStatusFilter.replace(/_/g, " ").toUpperCase()}`}
                onDelete={() => setPaymentStatusFilter("")}
                size="small"
                sx={{ bgcolor: "#e2e8f0" }}
              />
            )}
            <Button
              size="small"
              onClick={handleClearFilters}
              sx={{
                textTransform: "none",
                fontSize: "0.85rem",
                color: "#64748b",
              }}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TableContainer
          component={Paper}
          sx={{ boxShadow: "none", bgcolor: "transparent" }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                  <span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">
                    Order #
                  </span>
                </TableCell>
                <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                  <span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">
                    Customer
                  </span>
                </TableCell>
                <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                  <span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">
                    Items
                  </span>
                </TableCell>
                <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                  <span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">
                    Total
                  </span>
                </TableCell>
                <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                  <span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">
                    Payment
                  </span>
                </TableCell>
                <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                  <span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">
                    Status
                  </span>
                </TableCell>
                <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                  <span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">
                    Date
                  </span>
                </TableCell>
                <TableCell align="center" sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                  <span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">
                    Action
                  </span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-500 font-medium">
                        No orders found
                      </p>
                      <p className="text-slate-400 text-sm">
                        Try adjusting your filters
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
                      "&:hover": { bgcolor: "#f1f5f9" },
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                      <span className="text-[12px] 2xl:text-[14px] font-medium text-blue-600">
                        {order.orderNumber}
                      </span>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                      <div className="flex flex-col">
                        <span className="text-[13px] 2xl:text-[15px] font-medium text-slate-700">
                          {order.customer
                            ? `${order.customer.firstName} ${order.customer.lastName}`
                            : "Guest"}
                        </span>
                        <span className="text-[11px] 2xl:text-[13px] text-slate-500">
                          {order.customer?.email || order.guestEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                      <span className="text-[13px] 2xl:text-[15px] text-slate-600">
                        {order.items.length} items
                      </span>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                      <span className="text-[13px] 2xl:text-[15px] font-bold text-slate-700">
                        {formatCurrency(order.pricing.total, order.currency)}
                      </span>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                      {order.paymentSummary ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-green-600 font-medium">
                            Paid: {formatCurrency(order.paymentSummary.paidAmount, order.currency)}
                          </span>
                          {order.paymentSummary.pendingAmount > 0 && (
                            <span className="text-[11px] text-orange-600 font-medium">
                              Due: {formatCurrency(order.paymentSummary.pendingAmount, order.currency)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                      {renderStatusBadge(order.status)}
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                      <div className="flex flex-col">
                        <span className="text-[12px] 2xl:text-[14px] text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] 2xl:text-[12px] text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell align="center" sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                      <Tooltip title="View Details">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/orders/${order.id}`);
                          }}
                          size="small"
                          sx={{
                            color: "#94a3b8",
                            "&:hover": { color: "#475569" },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canEdit && (
                        <Tooltip title="Edit Order">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/orders/${order.id}/edit`);
                            }}
                            size="small"
                            sx={{
                              color: "#64748b",
                              "&:hover": { color: "#334155" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-slate-100">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </div>
        )}
      </div>

    </div>
  );
}

