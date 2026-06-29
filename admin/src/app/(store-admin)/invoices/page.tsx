"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Popover,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { Calendar, ChevronDown, ChevronUp, X } from "lucide-react";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useAppSelector } from "@/store/hooks";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export default function InvoicesPage() {
  const router = useRouter();
  const { admin } = useAppSelector((state) => state.auth);
  const canEdit =
    admin?.role === "super_admin" ||
    admin?.role === "admin" ||
    admin?.role === "store_admin" ||
    admin?.permissions?.includes("*") ||
    admin?.permissions?.includes("invoices.edit");

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const isPopoverOpen = Boolean(anchorEl);
  const popoverId = isPopoverOpen ? "date-period-popover" : undefined;

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const getPresetLabel = (preset: string) => {
    switch (preset) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "week":
        return "Last Week";
      case "month":
        return "Last Month";
      case "year":
        return "Last Year";
      default:
        return "Select Period";
    }
  };

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params: Record<string, any> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${API_URL}/admin/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setInvoices(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error: unknown) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, startDate, endDate]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSearch = () => {
    setPage(1);
    fetchInvoices();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setTempStartDate("");
    setTempEndDate("");
    setDatePreset("all");
    setPage(1);
  };

  const handleSendInvoice = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/admin/invoices/${id}/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Invoice sent successfully!");
      fetchInvoices();
    } catch (error: unknown) {
      console.error("Error sending invoice:", error);
      alert("Failed to send invoice");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Invoice deleted successfully!");
      fetchInvoices();
    } catch (error: unknown) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice");
    }
  };

  return (
    <div className="p-6 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your invoices and billing details.</p>
        </div>
        {canEdit && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => router.push("/invoices/create")}
            sx={{
              bgcolor: "var(--primary)",
              "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
              px: 3,
              height: "30px",
            }}
          >
            Create Invoice
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <TextField
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          size="small"
          sx={{
            width: 300,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              height: "36px",
              fontSize: "13px",
              backgroundColor: "#ffffff !important",
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" className="text-slate-400" />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

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

        <div className="flex flex-wrap items-center gap-2 pb-0.5">
          {[
            { label: "All", value: "" },
            { label: "Draft", value: "draft" },
            { label: "Sent", value: "sent" },
            { label: "Paid", value: "paid" },
            { label: "Partially Paid", value: "partially_paid" },
            { label: "Overdue", value: "overdue" },
            { label: "Cancelled", value: "cancelled" },
          ].map((status) => {
            const isActive = statusFilter === status.value;
            return (
              <Button
                key={status.value}
                variant={isActive ? "contained" : "outlined"}
                onClick={() => {
                  setStatusFilter(status.value);
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
                {status.label}
              </Button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <TableContainer sx={{ boxShadow: "none", bgcolor: "transparent" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Invoice #
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Customer
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Invoice Date
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Due Date
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Total
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Amount Due
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Status
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Actions
                      </span>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <span className="text-slate-500 text-sm">
                          No invoices found
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice: any) => (
                      <TableRow
                        key={invoice.id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "#f1f5f9" },
                          cursor: "pointer",
                        }}
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                      >
                        <TableCell sx={{ py: 1.5 }}>
                          <span className="text-[13px] font-medium text-blue-600">
                            {invoice.invoiceNumber}
                          </span>
                          {invoice.order && (
                            <span
                              className="text-[11px] text-slate-500 hover:text-blue-600 hover:underline cursor-pointer mt-0.5 block"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/orders/${invoice.order.id}`);
                              }}
                            >
                              Order #
                              {invoice.order.orderNumber.length > 8
                                ? `...${invoice.order.orderNumber.slice(-6)}`
                                : invoice.order.orderNumber}
                            </span>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-slate-700">
                              {invoice.customer.name}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {invoice.customer.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <span className="text-[13px] text-slate-600">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <span className="text-[13px] text-slate-600">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <span className="text-[13px] font-medium text-slate-700">
                            ₹{Number(invoice.pricing?.total || 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <span
                            className={`text-[13px] font-bold ${invoice.amountDue > 0
                              ? "text-red-600"
                              : "text-green-600"
                              }`}
                          >
                            ₹{Number(invoice.amountDue || 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${invoice.status === "paid"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : invoice.status === "overdue"
                                ? "bg-red-50 text-red-600 border-red-100"
                                : invoice.status === "partially_paid"
                                  ? "bg-orange-50 text-orange-600 border-orange-100"
                                  : invoice.status === "sent"
                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                    : "bg-gray-50 text-gray-600 border-gray-100"
                              }`}
                          >
                            {invoice.status.replace("_", " ").toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, verticalAlign: "middle" }}>
                          <div
                            className="flex items-center justify-start gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  router.push(`/invoices/${invoice.id}`)
                                }
                                sx={{
                                  color: "#94a3b8",
                                  "&:hover": { color: "#475569" },
                                }}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {canEdit && (
                              <>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      router.push(
                                        `/invoices/${invoice.id}/edit`
                                      )
                                    }
                                    sx={{
                                      color: "#64748b",
                                      "&:hover": { color: "#334155" },
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Send">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleSendInvoice(invoice.id)
                                    }
                                    sx={{
                                      color: "#60a5fa",
                                      "&:hover": { color: "#3b82f6" },
                                    }}
                                  >
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {invoice.status !== "paid" && (
                                  <Tooltip title="Add Payment">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        router.push(
                                          `/invoices/${invoice.id}#payment`
                                        )
                                      }
                                      sx={{
                                        color: "#4ade80",
                                        "&:hover": { color: "#22c55e" },
                                      }}
                                    >
                                      <PaymentIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {invoice.status === "draft" && (
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDelete(invoice.id)}
                                      sx={{
                                        color: "#f87171",
                                        "&:hover": { color: "#ef4444" },
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          <div className="flex justify-center p-4">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </div>
        </>
      )}
    </div>
  );
}
