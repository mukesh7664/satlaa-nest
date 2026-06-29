"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Chip,
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  Popover,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowLeftIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckMarkIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import Link from "next/link";

export default function ReturnRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const data = await apiService.get("/return-requests/admin", { params });
      setRequests(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [startDate, endDate]);

  const renderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    const configs: Record<string, { color: string; dotColor: string }> = {
      PENDING: { color: "#b45309", dotColor: "#f59e0b" }, // Amber 700 / 500
      APPROVED: { color: "#1d4ed8", dotColor: "#3b82f6" }, // Blue 700 / 500
      PICKED_UP: { color: "#7e22ce", dotColor: "#a855f7" }, // Purple 700 / 500
      QC_PASSED: { color: "#0e7490", dotColor: "#06b6d4" }, // Cyan 700 / 500
      COMPLETED: { color: "#15803d", dotColor: "#22c55e" }, // Green 700 / 500
      REJECTED: { color: "#b91c1c", dotColor: "#ef4444" }, // Red 700 / 500
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
          {s === "COMPLETED" && (
            <CheckMarkIcon sx={{ fontSize: 14 }} />
          )}
          {s === "REJECTED" && <ErrorIcon sx={{ fontSize: 14 }} />}
        </Typography>
      </Box>
    );
  };

  const filteredRequests = requests.filter((req) =>
    (req.order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.orderItem?.productName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === "" || req.status === statusFilter)
  );

  return (
    <Box className="p-6 space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <Typography variant="h5" fontWeight="bold" className="text-slate-800">Return & Replacement Requests</Typography>
          <Typography variant="body2" color="textSecondary" className="mt-1">
            Manage product returns and replacements from customers.
          </Typography>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <TextField
          size="small"
          placeholder="Search by Order # or Product"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="w-4 h-4 text-slate-400" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
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
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Picked Up", value: "PICKED_UP" },
            { label: "QC Passed", value: "QC_PASSED" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Rejected", value: "REJECTED" },
          ].map((status) => {
            const isActive = statusFilter === status.value;
            return (
              <Button
                key={status.value}
                variant={isActive ? "contained" : "outlined"}
                onClick={() => setStatusFilter(status.value)}
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
        <div className="flex justify-center items-center min-h-[40vh]">
          <CircularProgress />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <TableContainer sx={{ boxShadow: "none", bgcolor: "transparent" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                  <TableCell><span className="text-[11px] uppercase font-bold text-slate-500">Date</span></TableCell>
                  <TableCell><span className="text-[11px] uppercase font-bold text-slate-500">Order #</span></TableCell>
                  <TableCell><span className="text-[11px] uppercase font-bold text-slate-500">Product</span></TableCell>
                  <TableCell><span className="text-[11px] uppercase font-bold text-slate-500">Type</span></TableCell>
                  <TableCell><span className="text-[11px] uppercase font-bold text-slate-500">Reason</span></TableCell>
                  <TableCell><span className="text-[11px] uppercase font-bold text-slate-500">Status</span></TableCell>
                  <TableCell align="right"><span className="text-[11px] uppercase font-bold text-slate-500">Action</span></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className="py-10">
                      No return requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell className="text-[13px]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-[13px] font-medium text-blue-600">
                        #{req.order?.orderNumber}
                      </TableCell>
                      <TableCell className="text-[13px] max-w-[200px] truncate">
                        {req.orderItem?.productName}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={req.type}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            ...(req.type === 'RETURN'
                              ? { color: '#ea580c', borderColor: '#fdba74', bgcolor: '#fff7ed' }
                              : { color: '#2563eb', borderColor: '#bfdbfe', bgcolor: '#eff6ff' })
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-[13px] max-w-[150px] truncate">
                        {req.reason}
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(req.status)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            onClick={() => router.push(`/orders/return-requests/${req.id}`)}
                            size="small"
                            sx={{ color: "#94a3b8" }}
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
      )}
    </Box>
  );
}
