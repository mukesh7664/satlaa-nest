"use client";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Tooltip,
  TextField,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Pagination,
  Popover,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { Calendar, ChevronDown, ChevronUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { inquiriesApi, Inquiry } from "@/services/inquiries.api";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";

export default function InquiriesPage() {
  const { admin } = useAppSelector((state) => state.auth);
  
  const canEdit =
    admin?.role === "super_admin" ||
    admin?.role === "admin" ||
    admin?.role === "store_admin" ||
    admin?.permissions?.includes("inquiries.edit");

  const [page, setPage] = React.useState(1);
  const [rowsPerPage] = React.useState(20);
  const [inquiries, setInquiries] = React.useState<Inquiry[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedInquiryId, setSelectedInquiryId] = React.useState<
    string | null
  >(null);
  const router = useRouter();

  const [datePreset, setDatePreset] = React.useState("all");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [tempStartDate, setTempStartDate] = React.useState("");
  const [tempEndDate, setTempEndDate] = React.useState("");
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

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

  const fetchInquiries = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await inquiriesApi.getInquiries({
        page: page,
        limit: rowsPerPage,
        search: search || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setInquiries(response.inquiries);
      setTotal(response.total);
    } catch (err: any) {
      console.error("Failed to fetch inquiries", err);
      toast.error(err.message || "Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter, typeFilter, startDate, endDate]);

  React.useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleSearch = () => {
    setPage(1);
    fetchInquiries();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setStartDate("");
    setEndDate("");
    setTempStartDate("");
    setTempEndDate("");
    setDatePreset("all");
    setPage(1);
  };

  const handleDeleteInquiry = async () => {
    if (!selectedInquiryId) return;

    try {
      await inquiriesApi.deleteInquiry(selectedInquiryId);
      setDeleteDialogOpen(false);
      setSelectedInquiryId(null);
      toast.success("Inquiry deleted successfully");
      fetchInquiries();
    } catch (err: any) {
      console.error("Failed to delete inquiry", err);
      toast.error(err.message || "Failed to delete inquiry");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await inquiriesApi.updateInquiryStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchInquiries();
    } catch (err: any) {
      console.error("Failed to update status", err);
      toast.error(err.message || "Failed to update status");
    }
  };

  return (
    <div className="p-6 space-y-4 font-sans">
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inquiries & Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and respond to customer inquiries and lead capture submissions.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-grow md:flex-grow-0">
          <TextField
            placeholder="Search by name, email, subject..."
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
              { label: "Pending", value: "pending" },
              { label: "Replied", value: "replied" },
              { label: "Converted", value: "converted" },
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
                    minHeight: "30px",
                    boxSizing: "border-box",
                    paddingY: 0,
                    paddingX: "12px",
                    minWidth: "auto",
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

        <div>
          <TextField
            select
            size="small"
            label="Type"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            sx={{
              minWidth: 150,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                height: "36px",
                fontSize: "13px",
                backgroundColor: "#ffffff !important",
              },
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                height: "36px",
                boxSizing: "border-box",
                paddingTop: 0,
                paddingBottom: 0,
              },
              "& .MuiInputLabel-root": {
                transform: "translate(14px, 8px) scale(1)",
                fontSize: "13px",
              },
              "& .MuiInputLabel-shrink": {
                transform: "translate(14px, -6px) scale(0.75)",
              }
            }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="lead">Lead</MenuItem>
            <MenuItem value="inquiry">Inquiry</MenuItem>
            <MenuItem value="contact_us">Contact Us</MenuItem>
            <MenuItem value="quote">Quote</MenuItem>
          </TextField>
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
                        Type
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Name
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Email & Phone
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Subject
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Status
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                        Date
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
                  {inquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <span className="text-slate-500 text-sm">
                          No inquiries found
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    inquiries.map((inq) => (
                      <TableRow
                        key={inq.id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "#f1f5f9" },
                          cursor: "pointer",
                        }}
                        onClick={() => router.push(`/inquiries/${inq.id}`)}
                      >
                        <TableCell sx={{ py: 1.5 }}>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            inq.type === "lead" 
                            ? "bg-purple-50 text-purple-600 border-purple-100" 
                            : inq.type === "contact_us"
                            ? "bg-orange-50 text-orange-600 border-orange-100"
                            : inq.type === "quote"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                          }`}>
                            {inq.type.replace("_", " ").toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <span className="text-[13px] font-medium text-slate-700">
                            {inq.name}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <div className="flex flex-col">
                            <span className="text-[13px] text-slate-700">
                              {inq.email}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {inq.phone || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <span className="text-[13px] text-slate-600">
                            {inq.subject || 'No Subject'}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${inq.status === "converted"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : inq.status === "replied"
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                              }`}
                          >
                            {inq.status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <span className="text-[13px] text-slate-600">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <div
                            className="flex items-center justify-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  router.push(`/inquiries/${inq.id}`)
                                }
                                sx={{
                                  color: "#94a3b8",
                                  "&:hover": { color: "#475569" },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {canEdit && (
                              <>
                                <Tooltip title="Mark as Replied">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleStatusChange(inq.id, "replied")
                                    }
                                    sx={{
                                      color: "#60a5fa",
                                      "&:hover": { color: "#2563eb" },
                                    }}
                                    disabled={inq.status === "replied" || inq.status === "converted"}
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedInquiryId(inq.id);
                                      setDeleteDialogOpen(true);
                                    }}
                                    sx={{
                                      color: "#f87171",
                                      "&:hover": { color: "#ef4444" },
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
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
              count={Math.ceil(total / rowsPerPage)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </div>
        </>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this inquiry? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteInquiry}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
