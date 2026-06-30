"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Pagination,
  Popover,
  Button,
} from "@mui/material";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { getPayments, getPaymentAttempts } from "@/services/payments.api";
import { useAppSelector } from "@/store/hooks";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id: string;
  gateway_name: string;
  status: string;
  paid_at: string;
  created_at: string;
  payment_type: string;
  store?: {
    storeName: string;
  };
}

interface PaymentAttempt {
  id: string;
  amount: number;
  currency: string;
  payment_gateway: string;
  payment_status: string;
  gateway_order_id: string;
  failure_reason: string;
  created_at: string;
  store_name?: string;
  plan_id?: string;
  order?: {
    orderNumber: string;
    id: string;
  };
}

export default function PaymentsPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

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

  const { admin } = useAppSelector((state) => state.auth);
  const isSuperAdmin = admin?.role === "admin" || admin?.role === "sub_admin";

  useEffect(() => {
    fetchData();
  }, [tabValue, page, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (page - 1) * limit;

      if (tabValue === 0) {
        const data = await getPayments(limit, offset, startDate, endDate);
        setPayments(data.items || []);
        setTotal(data.total || 0);
      } else {
        const data = await getPaymentAttempts(limit, offset, startDate, endDate);
        setAttempts(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (err: any) {
      console.error("Error fetching payment data:", err);
      setError(err.response?.data?.message || "Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isSuperAdmin ? "Track subscription payments from all stores" : "Track successful transactions and hidden payment attempts"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Period Filter (Custom Popover) */}
        <div className="relative flex items-center">
          <button
            onClick={handleOpenPopover}
            className={`flex items-center justify-between gap-2 pl-3 ${
              datePreset !== "all" ? "pr-8" : "pr-3"
            } bg-white border border-slate-200 rounded-[8px] hover:border-slate-300 transition-all shadow-sm focus:outline-none select-none h-[36px] min-w-[130px] text-xs font-medium text-slate-600 cursor-pointer`}
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

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 pb-0.5">
          {[
            { label: "Successful Payments", value: 0 },
            { label: "Payment Attempts", value: 1 },
          ].map((tab) => {
            const isActive = tabValue === tab.value;
            return (
              <Button
                key={tab.value}
                variant={isActive ? "contained" : "outlined"}
                onClick={() => {
                  setTabValue(tab.value);
                  setPage(1);
                }}
                size="small"
                sx={{
                  height: "30px",
                  textTransform: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  ...(isActive ? {
                    bgcolor: "var(--primary)",
                    color: "#ffffff",
                    borderColor: "var(--primary)",
                    "&:hover": {
                      bgcolor: "var(--primary)",
                      filter: "brightness(0.9)",
                    }
                  } : {
                    bgcolor: "#ffffff",
                    color: "var(--muted-foreground, #475569)",
                    borderColor: "var(--border, #e2e8f0)",
                    "&:hover": {
                      bgcolor: "#f8fafc",
                      borderColor: "var(--border, #cbd5e1)",
                    }
                  })
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <TableContainer sx={{ boxShadow: "none", bgcolor: "transparent" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    {tabValue === 0 ? (
                      <>
                        {isSuperAdmin && <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Store</span></TableCell>}
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Transaction ID</span></TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Amount</span></TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Method</span></TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Gateway</span></TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Date</span></TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Status</span></TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">{isSuperAdmin ? "Store Name" : "Order #"}</span></TableCell>
                        {isSuperAdmin && <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Plan</span></TableCell>}
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Amount</span></TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Gateway Order ID</span></TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Date</span></TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Status</span></TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}><span className="text-[10px] 2xl:text-[12px] uppercase tracking-wider font-bold text-slate-500">Reason</span></TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(tabValue === 0 ? payments : attempts).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isSuperAdmin ? 8 : 7} align="center" sx={{ py: 8 }}>
                        <Typography color="textSecondary">No data available</Typography>
                      </TableCell>
                    </TableRow>
                  ) : tabValue === 0 ? (
                    payments.map((payment: any) => (
                      <TableRow key={payment.id} hover>
                        {isSuperAdmin && (
                          <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                            <span className="text-[12px] 2xl:text-[14px] font-bold text-slate-700">{payment.store?.storeName || "Registration"}</span>
                          </TableCell>
                        )}
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <span className="text-[12px] 2xl:text-[14px] font-medium text-blue-600">{payment.transaction_id || "N/A"}</span>
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <span className="text-[12px] 2xl:text-[14px] font-bold text-slate-700">₹{Number(payment.amount).toFixed(2)}</span>
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <span className="text-[12px] 2xl:text-[14px] text-slate-600 capitalize">{payment.payment_method?.replace(/_/g, " ")}</span>
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <span className="text-[12px] 2xl:text-[14px] text-slate-600">{payment.gateway_name}</span>
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <div className="flex flex-col">
                            <span className="text-[11px] 2xl:text-[13px] text-slate-600">{new Date(payment.paid_at || payment.created_at).toLocaleDateString()}</span>
                            <span className="text-[9px] 2xl:text-[11px] text-slate-400">{new Date(payment.paid_at || payment.created_at).toLocaleTimeString()}</span>
                          </div>
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <Chip 
                            label={payment.status?.toUpperCase()} 
                            size="small" 
                            color={payment.status === "success" ? "success" : "default"}
                            sx={{ fontSize: { xs: "10px", '2xl': "12px" }, fontWeight: 700, height: { xs: 20, '2xl': 32 } }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    attempts.map((attempt: any) => (
                      <TableRow key={attempt.id} hover>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <span className="text-[12px] 2xl:text-[14px] font-medium text-slate-700">
                            {isSuperAdmin ? attempt.store_name : (attempt.order?.orderNumber || "Registration")}
                          </span>
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                            <span className="text-[12px] 2xl:text-[14px] text-slate-600">{attempt.plan_id || "N/A"}</span>
                          </TableCell>
                        )}
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <span className="text-[12px] 2xl:text-[14px] font-bold text-slate-700">₹{Number(attempt.amount).toFixed(2)}</span>
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <span className="text-[12px] 2xl:text-[14px] text-slate-500 font-mono">{attempt.gateway_order_id || "N/A"}</span>
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <div className="flex flex-col">
                            <span className="text-[12px] 2xl:text-[14px] text-slate-600">{new Date(attempt.created_at).toLocaleDateString()}</span>
                            <span className="text-[10px] 2xl:text-[12px] text-slate-400">{new Date(attempt.created_at).toLocaleTimeString()}</span>
                          </div>
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <Chip 
                            label={attempt.payment_status?.toUpperCase()} 
                            size="small" 
                            color={attempt.payment_status === "success" ? "success" : attempt.payment_status === "failed" ? "error" : "warning"}
                            sx={{ fontSize: { xs: "10px", '2xl': "12px" }, fontWeight: 700, height: { xs: 20, '2xl': 32 } }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1, '2xl': 3.5 } }}>
                          <span className="text-[12px] 2xl:text-[14px] text-red-500 italic max-w-[200px] block truncate" title={attempt.failure_reason}>
                            {attempt.failure_reason || "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {total > limit && (
            <div className="flex justify-center p-4">
              <Pagination
                count={Math.ceil(total / limit)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
