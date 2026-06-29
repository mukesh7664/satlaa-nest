"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Button, IconButton, CircularProgress, TextField, MenuItem, InputAdornment, Switch } from "@mui/material";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { Discount, DiscountType, discountsApi } from "@/services/discounts.api";

export default function DiscountsPage() {
  const router = useRouter();
  const { admin } = useAppSelector((state) => state.auth);
  
  const canEdit =
    admin?.role === "super_admin" ||
    admin?.role === "admin" ||
    admin?.role === "store_admin" ||
    admin?.permissions?.includes("discounts.edit") ||
    admin?.permissions?.includes("products.manage");

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await discountsApi.getDiscounts({
        page,
        limit: 20,
        search,
        is_active: filterActive,
        type: filterType,
      });

      setDiscounts(response.discounts);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalDiscounts);
    } catch (error: any) {
      console.error("Error fetching discounts:", error);
      toast.error(error.message || "Error fetching discounts");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterActive, filterType]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleToggleStatus = async (id: string) => {
    try {
      await discountsApi.toggleDiscountStatus(id);
      toast.success("Discount status updated");
      fetchDiscounts();
    } catch (error: any) {
      console.error("Error toggling discount status:", error);
      toast.error(error.message || "Error toggling discount status");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      await discountsApi.deleteDiscount(deleteDialog.id);
      toast.success("Discount deleted successfully");
      fetchDiscounts();
      setDeleteDialog({ open: false, id: null });
    } catch (error: any) {
      console.error("Error deleting discount:", error);
      toast.error(error.message || "Error deleting discount");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDiscountDisplay = (discount: Discount) => {
    switch (discount.type) {
      case DiscountType.PERCENTAGE:
        return `${discount.value}% off${discount.max_discount_cap ? ` (max ₹${discount.max_discount_cap})` : ""}`;
      case DiscountType.FIXED_AMOUNT:
        return `₹${discount.value} off`;
      case DiscountType.FREE_SHIPPING:
        return "Free Shipping";
      case DiscountType.BOGO:
        return `Buy ${discount.buy_qty} Get ${discount.get_qty} Free`;
      case DiscountType.BUY_X_GET_Y_PERCENT:
        return `Buy ${discount.buy_qty} Get ${discount.value}% off on ${discount.get_qty} more`;
      default:
        return "Custom Discount";
    }
  };

  return (
    <div className="p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Discounts & Promotions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage automatic discounts and coupon codes
            </p>
          </div>
          {canEdit && (
            <Button
              variant="contained"
              onClick={() => router.push("/discounts/create")}
              startIcon={<AddIcon fontSize="small" />}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                bgcolor: "var(--primary)",
                "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
                px: 3,
              }}
            >
              Create Discount
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <TextField
              size="small"
              fullWidth
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ bgcolor: "white" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <TextField
            select
            size="small"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            sx={{ bgcolor: "white", minWidth: 150 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ bgcolor: "white", minWidth: 180 }}
          >
            <MenuItem value="all">All Types</MenuItem>
            {Object.values(DiscountType).map((type) => (
              <MenuItem key={type} value={type}>
                {type.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Code / Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <CircularProgress />
                      </div>
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-slate-500 font-medium">
                          No discounts found
                        </p>
                        <p className="text-slate-400 text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount) => (
                    <tr
                      key={discount.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-700 font-bold">
                            {discount.name}
                          </span>
                          {discount.code ? (
                            <span className="font-mono text-[#408dfb] text-xs">
                              {discount.code}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                              Automatic
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {getDiscountDisplay(discount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {discount.current_usage_count} /{" "}
                          {discount.usage_limit || "∞"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-slate-500">
                          <span>{formatDate(discount.starts_at)}</span>
                          <span>to {formatDate(discount.ends_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${discount.is_active
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                        >
                          {discount.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() =>
                              router.push(`/discounts/${discount.id}`)
                            }
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() =>
                                  router.push(`/discounts/${discount.id}/edit`)
                                }
                                className="p-1.5 text-[#408dfb] hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <EditIcon fontSize="small" />
                              </button>
                              <Switch
                                checked={discount.is_active}
                                onChange={() => handleToggleStatus(discount.id)}
                                size="small"
                                sx={{
                                  "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "#408dfb",
                                    "&:hover": {
                                      backgroundColor: "rgba(64, 141, 251, 0.08)",
                                    },
                                  },
                                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                    backgroundColor: "#408dfb",
                                  },
                                }}
                              />
                            </>
                          )}
                          {canEdit && (
                            <button
                              onClick={() =>
                                setDeleteDialog({ open: true, id: discount.id })
                              }
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Page {page} of {totalPages} ({totalItems} total)
              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  size="small"
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  size="small"
                >
                  <ChevronRightIcon />
                </IconButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  Delete Discount
                </h3>
                <IconButton
                  onClick={() => setDeleteDialog({ open: false, id: null })}
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete this discount? This action cannot
                be undone and will stop it from being applied to any active carts.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setDeleteDialog({ open: false, id: null })}
                  variant="text"
                  sx={{ color: "text.secondary" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="contained"
                  color="error"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
