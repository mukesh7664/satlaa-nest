
"use client";

import React, { useEffect, useState } from "react";
import { auditLogsApi, IAuditLog } from "@/services/auditLogs.api";
import { toast } from "sonner";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  FormControl,
  InputLabel,
  CircularProgress,
  SelectChangeEvent,
  TablePagination,
} from "@mui/material";

const FormattedValue = ({ value, className = "" }: { value: any; className?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (value === null || value === undefined) return null;
  
  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  const isLong = stringValue.length > 80;
  
  const displayValue = isExpanded 
    ? stringValue 
    : isLong 
      ? `${stringValue.substring(0, 75)}...` 
      : stringValue;
      
  return (
    <span className={`inline-block break-all text-[11px] sm:text-xs font-mono max-w-[180px] sm:max-w-[300px] md:max-w-[400px] ${className}`}>
      {displayValue}
      {isLong && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="ml-1.5 text-indigo-600 hover:text-indigo-800 hover:underline font-bold focus:outline-none text-[10px] normal-case"
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
    </span>
  );
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    resourceType: "",
    adminId: "",
  });

  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const fetchLogs = async (page = 1, limit = pagination.limit) => {
    try {
      setLoading(true);
      const data = await auditLogsApi.getLogs({
        ...filters,
        page,
        limit,
      });
      // The API now returns { data: logs, pagination: { ... } }
      const processedLogs = data.data.map((log: any) => ({
        ...log,
        id: log.id || log._id 
      }));
      setLogs(processedLogs);
      setPagination(data.pagination);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    fetchLogs(newPage + 1, pagination.limit);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    fetchLogs(1, newLimit);
  };

  useEffect(() => {
    fetchLogs(pagination.page);
  }, [pagination.page, filters.action, filters.resourceType, filters.search]); // Auto-refetch on any filter change

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    // Reset pagination to page 1 on filter change
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  const toggleExpand = (id: string) => {
    setExpandedRowId(prev => prev === id ? null : id);
  };

  const renderChanges = (log: IAuditLog) => {
    const { changes } = log as any;
    const items = changes?.changes || [];
    
    if (items.length === 0) {
      return (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-500 italic text-xs flex items-center gap-2">
            <SearchIcon fontSize="small" /> No technical diff available
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Changes</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>
        <div className="space-y-2">
          {items.map((item: any) => (
            <div key={item.field} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-indigo-100 transition-colors gap-2 min-w-0">
              <span className="text-xs font-bold text-slate-700 min-w-[140px] uppercase tracking-tighter opacity-70 break-all">{item.field}</span>
              <div className="flex items-center gap-2 text-xs flex-1 justify-end min-w-0">
                {item.after === 'changed' ? (
                  <span className="text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1 shadow-sm shrink-0">
                    🔒 changed
                  </span>
                ) : item.after === 'removed' ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <FormattedValue 
                      value={item.before} 
                      className="text-slate-400 line-through decoration-red-300 bg-slate-50 px-1.5 py-0.5 rounded" 
                    />
                    <span className="text-red-500 font-black text-[10px] uppercase bg-red-50 px-2 py-0.5 rounded border border-red-200 shrink-0">removed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap justify-end min-w-0">
                    {item.before !== null && item.before !== undefined && (
                      <>
                        <FormattedValue 
                          value={item.before} 
                          className="text-red-500 bg-red-50 px-2 py-0.5 rounded line-through decoration-red-200 opacity-80 border border-red-100" 
                        />
                        <span className="text-slate-300 font-bold shrink-0">→</span>
                      </>
                    )}
                    <FormattedValue 
                      value={item.after} 
                      className="text-green-700 bg-green-50 px-2.5 py-1 rounded font-bold border border-green-200 shadow-sm" 
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor all administrative actions and changes.
          </p>
        </div>
        <Button
          onClick={() => fetchLogs(pagination.page)}
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon sx={{ fontSize: { xs: 16, '2xl': 18 } }} />}
          sx={{ 
            textTransform: "none", 
            borderRadius: "10px", 
            fontWeight: 700,
            fontSize: { xs: 12, '2xl': 14 },
            height: "30px",
          }}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-2">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 max-w-sm">
            <TextField
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search logs..."
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" className="text-slate-400" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: 'white',
                  height: '36px',
                }
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "All", value: "" },
              { label: "Create", value: "CREATE" },
              { label: "Update", value: "UPDATE" },
              { label: "Delete", value: "DELETE" }
            ].map((item) => {
              const isActive = filters.action === item.value;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, action: item.value }));
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`flex items-center justify-center px-4 h-[30px] text-xs font-bold rounded-lg border transition-colors ${
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 2xl:px-6 py-3 2xl:py-4 text-[11px] 2xl:text-xs font-bold uppercase tracking-wider">Timestamp</th>
                <th className="px-4 2xl:px-6 py-3 2xl:py-4 text-[11px] 2xl:text-xs font-bold uppercase tracking-wider">Actor</th>
                <th className="px-4 2xl:px-6 py-3 2xl:py-4 text-[11px] 2xl:text-xs font-bold uppercase tracking-wider">Action</th>
                <th className="px-4 2xl:px-6 py-3 2xl:py-4 text-[11px] 2xl:text-xs font-bold uppercase tracking-wider">Target Entity</th>
                <th className="px-4 2xl:px-6 py-3 2xl:py-4 text-[11px] 2xl:text-xs font-bold uppercase tracking-wider">Description</th>
                <th className="px-4 2xl:px-6 py-3 2xl:py-4 text-[11px] 2xl:text-xs font-bold uppercase tracking-wider text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    <CircularProgress size={24} className="mb-2" />
                    <p>Loading logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className={`hover:bg-slate-50 transition-colors ${expandedRowId === log.id ? "bg-slate-50" : ""}`}>
                      <td className="px-4 2xl:px-6 py-3 2xl:py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-[12px] 2xl:text-sm">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] 2xl:text-xs text-slate-400 font-medium">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 2xl:px-6 py-3 2xl:py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 2xl:w-8 2xl:h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] 2xl:text-xs font-bold shrink-0">
                            {log.user?.name?.charAt(0) || "A"}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-700 text-[12px] 2xl:text-sm truncate max-w-[130px] 2xl:max-w-[180px]" title={log.user?.name || "Unknown"}>
                              {log.user?.name || "Unknown"}
                            </span>
                            <span className="text-[10px] 2xl:text-xs text-slate-400 font-medium truncate max-w-[130px] 2xl:max-w-[180px]" title={log.user?.email || "N/A"}>
                              {log.user?.email || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${log.action === "CREATE" ? "bg-green-100 text-green-800" :
                            log.action === "UPDATE" ? "bg-blue-100 text-blue-800" :
                              log.action === "DELETE" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                            {log.resourceType}
                          </span>
                          <span className="font-medium text-slate-700 break-all max-w-[150px] inline-block" title={log.resourceName || log.resourceId || "N/A"}>
                            {log.resourceName || log.resourceId || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-600 line-clamp-2 max-w-xs" title={log.actionDescription}>
                          {log.actionDescription}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          onClick={() => toggleExpand(log.id)}
                          variant={expandedRowId === log.id ? "outlined" : "contained"}
                          size="small"
                          color={expandedRowId === log.id ? "inherit" : "primary"}
                          sx={{
                            textTransform: "none",
                            fontSize: "0.7rem",
                            whiteSpace: "nowrap",
                            minWidth: "100px"
                          }}
                        >
                          {expandedRowId === log.id ? "Hide Details" : "View Details"}
                        </Button>
                      </td>
                    </tr>
                    {expandedRowId === log.id && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50 p-0 border-b border-slate-200">
                          <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-tight">Action Summary</h4>
                              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <p className="text-slate-700 font-medium">{log.actionDescription}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-tight">Data Changes</h4>
                              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                {renderChanges(log)}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-tight">Metadata</h4>
                                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                                  <div className="flex justify-between border-b border-slate-50 pb-1 gap-2">
                                    <span className="text-slate-500 shrink-0">IP Address</span>
                                    <span className="font-mono text-slate-700 break-all text-right">{log.ipAddress || "Unknown"}</span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-slate-500">User Agent</span>
                                    <span className="text-slate-700 break-all">{log.userAgent || "Unknown"}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-tight">Technical Details</h4>
                                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                                  <div className="flex justify-between border-b border-slate-50 pb-1 gap-2">
                                    <span className="text-slate-500 shrink-0">Audit Log ID</span>
                                    <span className="font-mono text-slate-700 break-all text-right">{log.id}</span>
                                  </div>
                                  <div className="flex justify-between gap-2">
                                    <span className="text-slate-500 shrink-0">Resource ID</span>
                                    <span className="font-mono text-slate-700 break-all text-right">{log.resourceId || "N/A"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]}
          sx={{
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
              color: '#64748b',
            },
          }}
        />
      </div>
    </div>
  );
}
