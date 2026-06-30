"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  IconButton,
  TablePagination,
  Chip,
  CircularProgress,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Autocomplete,
  SelectChangeEvent,
  Tooltip,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Public as PublicIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { productsApi, Product } from "@/services/products.api";
import { collectionsApi } from "@/services/collections.api";
import { settingsApi } from "@/services/settings.api";
import { usePlanLimits } from "@/hooks/usePlanLimits";

import { getCurrencySymbol } from "@/utils/currencyUtils";
import { useAppSelector } from "@/store/hooks";

export default function ProductListPage() {
  const router = useRouter();
  const { admin } = useAppSelector((state) => state.auth);
  const canEdit =
    admin?.role === "admin" ||
    admin?.role === "admin" ||
    admin?.role === "admin" ||
    admin?.permissions?.includes("products.edit");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const isExportMenuOpen = Boolean(exportAnchorEl);
  const [storeDomain, setStoreDomain] = useState<string>("http://localhost:3000");
  const { limits, subscription, usage, loading: limitsLoading } = usePlanLimits();

  // Filters
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Filters - Initialize from URL if available
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [filterType, setFilterType] = useState(
    searchParams.get("productStructureType") || ""
  );
  const [filterStatus, setFilterStatus] = useState(
    searchParams.get("status") || ""
  );

  const [filterCollection, setFilterCollection] = useState<string[]>(
    searchParams.get("collection")
      ? searchParams.get("collection")!.split(",")
      : []
  );

  // Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Options
  const [collections, setCollections] = useState<any[]>([]);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOptions();
    fetchStoreDomain();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settings = await settingsApi.getSettings();
      setStoreSettings(settings);
    } catch (error) {
      console.error("Failed to fetch store settings:", error);
    }
  };

  const fetchStoreDomain = async () => {
    try {
      const domainsRes = await settingsApi.getDomains().catch(() => []);
      if (Array.isArray(domainsRes) && domainsRes.length > 0) {
        const customDomain = domainsRes.find((d: any) => d.type === "custom");
        const subDomain = domainsRes.find((d: any) => d.type === "subdomain");

        let protocol = window.location.protocol;
        const baseWebsiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

        if (customDomain) {
          if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
            setStoreDomain(`http://${customDomain.domain}`);
          } else {
            setStoreDomain(`${protocol}//${customDomain.domain}`);
          }
        } else if (subDomain) {
          let formattedDomain = subDomain.domain;
          if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
            const prefix = formattedDomain.split('.')[0];
            try {
              const parsedBaseUrl = new URL(baseWebsiteUrl);
              setStoreDomain(`${parsedBaseUrl.protocol}//${prefix}.${parsedBaseUrl.host}`);
            } catch (e) {
              setStoreDomain(`http://${prefix}.localhost:3000`);
            }
          } else {
            setStoreDomain(`${protocol}//${subDomain.domain}`);
          }
        } else {
          setStoreDomain(baseWebsiteUrl);
        }
      } else {
        setStoreDomain(process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000");
      }
    } catch (error) {
      console.error("Failed to fetch store domain:", error);
      setStoreDomain(process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    page,
    rowsPerPage,
    searchTerm,
    filterType,
    filterStatus,
    filterCollection,

    sortBy,
    sortOrder,
  ]);

  const fetchOptions = async () => {
    try {
      const [collectionsData] = await Promise.all([
        collectionsApi.getAllCollections({ limit: 100, isActive: true }),
      ]);
      setCollections(collectionsData.collections || []);
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    }
  };

  // Update URL params
  const updateUrlParams = (key: string, value: string | string[]) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!value || (Array.isArray(value) && value.length === 0)) {
      current.delete(key);
    } else {
      current.set(key, Array.isArray(value) ? value.join(",") : value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
  };

  // Update specific filters and sync with URL
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
    // Debounce this in a real app, but for now simple sync
    updateUrlParams("search", value);
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setFilterType(value);
    setPage(0);
    updateUrlParams("productStructureType", value);
  };


  const handleCollectionChange = (newValue: any[]) => {
    const ids = newValue.map((item) => item._id);
    setFilterCollection(ids);
    setPage(0);
    updateUrlParams("collection", ids);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        approvalStatus: filterStatus || undefined,
        collection:
          filterCollection.length > 0 ? filterCollection.join(",") : undefined,

        sortBy,
        sortOrder,
      };

      if (filterType && filterType !== "all") {
        params.productStructureType = filterType;
      }

      const response = await productsApi.getAllProducts(params);
      setProducts(response.products || []);
      setTotalCount(response.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await productsApi.deleteProduct(productToDelete);
      toast.success("Product deleted successfully");
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      toast.error(error.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await productsApi.toggleProductStatus(id);
      toast.success("Status updated successfully");
      fetchProducts();
    } catch (error: any) {
      console.error("Failed to toggle status:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await productsApi.toggleProductFeatured(id);
      toast.success("Featured status updated");
      fetchProducts();
    } catch (error: any) {
      console.error("Failed to toggle featured:", error);
      toast.error(error.message || "Failed to update featured");
    }
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportCsv = async () => {
    handleExportClose();
    try {
      setExporting(true);
      await productsApi.exportProductsCsv();
      toast.success("Products exported to CSV successfully");
    } catch (error: any) {
      console.error("CSV Export failed:", error);
      toast.error(error.message || "Failed to export products to CSV");
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = async () => {
    handleExportClose();
    try {
      setExporting(true);
      await productsApi.exportProductsJson();
      toast.success("Products exported to JSON successfully");
    } catch (error: any) {
      console.error("JSON Export failed:", error);
      toast.error(error.message || "Failed to export products to JSON");
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    document.getElementById("import-file-input")?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const result = await productsApi.importProducts(file);
      toast.success(
        `Import complete: ${result.success} products processed (${result.created} created, ${result.updated} updated)`
      );
      if (result.errors?.length > 0) {
        console.error("Import errors:", result.errors);
        toast.warning(
          `${result.errors.length} errors occurred during import. Check console for details.`
        );
      }
      fetchProducts();
    } catch (error: any) {
      console.error("Import failed:", error);
      toast.error(error.message || "Failed to import products");
    } finally {
      setImporting(false);
      event.target.value = ""; // Reset file input
    }
  };


  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            {(!subscription || limitsLoading) ? (
              "Loading plan information..."
            ) : (
              <>
                <span className={(usage?.products?.limit || limits.products) !== -1 && (usage?.products?.used || totalCount) >= (usage?.products?.limit || limits.products) ? "text-red-500 font-bold" : ""}>
                  Plan: {subscription.plan?.name} ({(usage?.products?.used || totalCount)} / {(usage?.products?.limit || limits.products) === -1 ? "Unlimited" : (usage?.products?.limit || limits.products)} used)
                </span>
                {(usage?.products?.limit || limits.products) !== -1 && (usage?.products?.used || totalCount) >= (usage?.products?.limit || limits.products) && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => router.push('/manage-subscription')}
                    sx={{ textTransform: 'none', color: '#4f46e5', fontWeight: 'bold', minWidth: 0, p: 0 }}
                  >
                    Upgrade Plan
                  </Button>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="import-file-input"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
          {canEdit && (
            <>
              <Tooltip title="Only .json format is supported for import">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={importing ? <CircularProgress size={16} color="inherit" /> : <FileUploadIcon />}
                  onClick={handleImportClick}
                  disabled={importing}
                  sx={{
                    color: "slate.600",
                    borderColor: "slate.300",
                    "&:hover": {
                      borderColor: "slate.400",
                      bgcolor: "slate.50",
                    },
                    textTransform: "none",
                    borderRadius: "8px",
                    height: "30px",
                  }}
                >
                  {importing ? "Importing..." : "Import"}
                </Button>
              </Tooltip>
              <Button
                variant="outlined"
                size="small"
                startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
                onClick={handleExportClick}
                disabled={exporting}
                sx={{
                  color: "slate.600",
                  borderColor: "slate.300",
                  "&:hover": {
                    borderColor: "slate.400",
                    bgcolor: "slate.50",
                  },
                  textTransform: "none",
                  borderRadius: "8px",
                  height: "30px",
                }}
              >
                {exporting ? "Exporting..." : "Export"}
              </Button>
              <Menu
                anchorEl={exportAnchorEl}
                open={isExportMenuOpen}
                onClose={handleExportClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleExportCsv}>Export as CSV</MenuItem>
                <MenuItem onClick={handleExportJson}>Export as JSON</MenuItem>
              </Menu>
            </>
          )}

          {canEdit && (
            <div className="flex gap-2">
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.push("/manage-products/add-bundle")}
                sx={{
                  color: "#7B3FF2",
                  borderColor: "#7B3FF2",
                  "&:hover": {
                    borderColor: "#7B3FF2",
                    bgcolor: "rgba(123, 63, 242, 0.04)",
                  },
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                  height: "30px",
                }}
              >
                Add Bundle
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.push("/manage-products/create-product")}
                sx={{
                  bgcolor: "var(--primary)",
                  "&:hover": {
                    bgcolor: "var(--primary)",
                    filter: "brightness(0.9)",
                  },
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                  height: "30px",
                }}
              >
                Add Product
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search - Single Row Layout */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2.5">
          {/* Search Field */}
          <TextField
            placeholder="Search products..."
            size="small"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" className="text-slate-400" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 160, md: 180, lg: 200 },
              flexShrink: 0,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                height: "30px",
                fontSize: "13px",
                backgroundColor: "#f8fafc",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
              },
            }}
          />

          {/* Type Pills */}
          <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
            {[
              { label: "All Types", value: "" },
              { label: "Single Product", value: "single" },
              { label: "Variant Type", value: "variable" },
              { label: "Bundle", value: "bundle" },
            ].map((item) => {
              const isActive = filterType === item.value;
              return (
                <Button
                  key={item.value}
                  variant={isActive ? "contained" : "outlined"}
                  size="small"
                  onClick={() => {
                    setFilterType(item.value);
                    setPage(0);
                    updateUrlParams("productStructureType", item.value);
                  }}
                  sx={{
                    minHeight: "30px",
                    height: "30px",
                    boxSizing: "border-box",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: "12px",
                    px: 1.5,
                    py: 0,
                    fontWeight: isActive ? 600 : 500,
                    bgcolor: isActive ? "var(--primary)" : "transparent",
                    color: isActive ? "#ffffff" : "#475569",
                    borderColor: isActive ? "var(--primary)" : "#e2e8f0",
                    "&:hover": {
                      bgcolor: isActive ? "var(--primary)" : "#f1f5f9",
                      borderColor: isActive ? "var(--primary)" : "#cbd5e1",
                      filter: isActive ? "brightness(0.95)" : "none",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Select dropdowns side-by-side */}
          <div className="flex items-center gap-2 flex-grow justify-end flex-wrap md:flex-nowrap">
            {/* Status Selector */}
            <FormControl size="small" sx={{ width: 110, flexShrink: 0 }}>
              <InputLabel sx={{ fontSize: "12px", transform: "translate(14px, 5px) scale(1)", "&.MuiInputLabel-shrink": { transform: "translate(14px, -6px) scale(0.75)" } }}>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                  updateUrlParams("status", e.target.value);
                }}
                label="Status"
                sx={{
                  borderRadius: "8px",
                  height: "30px",
                  fontSize: "12px",
                  backgroundColor: "#f8fafc",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
                }}
              >
                <MenuItem value="" sx={{ fontSize: "12px" }}>All Statuses</MenuItem>
                <MenuItem value="pending" sx={{ fontSize: "12px" }}>Pending</MenuItem>
                <MenuItem value="approved" sx={{ fontSize: "12px" }}>Approved</MenuItem>
                <MenuItem value="rejected" sx={{ fontSize: "12px" }}>Rejected</MenuItem>
              </Select>
            </FormControl>

            {/* Collection Autocomplete */}
            <Autocomplete
              multiple
              limitTags={0}
              id="collection-filter"
              options={collections}
              getOptionLabel={(option) => option.name}
              value={collections.filter((c) => filterCollection.includes(c._id))}
              onChange={(_, newValue) => handleCollectionChange(newValue)}
              sx={{ width: 140, flexShrink: 0 }}
              renderTags={() => null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    filterCollection.length > 0
                      ? `Collection (${filterCollection.length})`
                      : "Collection"
                  }
                  size="small"
                  placeholder={
                    filterCollection.length > 0 ? "" : "Search collections"
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      height: "30px",
                      fontSize: "12px",
                      backgroundColor: "#f8fafc",
                      "& fieldset": { borderColor: "#e2e8f0" },
                      "&:hover fieldset": { borderColor: "#cbd5e1" },
                      "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "12px",
                      transform: "translate(14px, 5px) scale(1)",
                    },
                    "& .MuiInputLabel-shrink": {
                      transform: "translate(14px, -6px) scale(0.75)",
                    },
                  }}
                />
              )}
            />

            {/* Sort By Selector */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <SortIcon fontSize="small" className="text-slate-400" />
              <FormControl size="small" sx={{ width: 130 }}>
                <InputLabel sx={{ fontSize: "12px", transform: "translate(14px, 5px) scale(1)", "&.MuiInputLabel-shrink": { transform: "translate(14px, -6px) scale(0.75)" } }}>Sort By</InputLabel>
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = (
                      e.target.value as string
                    ).split("-");
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder as "asc" | "desc");
                    setPage(0);
                  }}
                  label="Sort By"
                  sx={{
                    borderRadius: "8px",
                    height: "30px",
                    fontSize: "12px",
                    backgroundColor: "#f8fafc",
                    "& fieldset": { borderColor: "#e2e8f0" },
                    "&:hover fieldset": { borderColor: "#cbd5e1" },
                    "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
                  }}
                >
                  <MenuItem value="createdAt-desc" sx={{ fontSize: "12px" }}>Newest First</MenuItem>
                  <MenuItem value="createdAt-asc" sx={{ fontSize: "12px" }}>Oldest First</MenuItem>
                  <MenuItem value="productInfo.name-asc" sx={{ fontSize: "12px" }}>Name (A-Z)</MenuItem>
                  <MenuItem value="productInfo.name-desc" sx={{ fontSize: "12px" }}>Name (Z-A)</MenuItem>
                  <MenuItem value="simplePricing.basePrice-asc" sx={{ fontSize: "12px" }}>Price (Low-High)</MenuItem>
                  <MenuItem value="simplePricing.basePrice-desc" sx={{ fontSize: "12px" }}>Price (High-Low)</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        {/* Active Filters Chips */}
        {filterCollection.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 mt-2">
            {filterCollection.map((id) => {
              const col = collections.find((c) => c._id === id);
              return (
                <Chip
                  key={`col-${id}`}
                  label={`Collection: ${col?.name || "Unknown"}`}
                  onDelete={() => {
                    const newCols = filterCollection.filter((c) => c !== id);
                    handleCollectionChange(
                      collections.filter((c) => newCols.includes(c._id))
                    );
                  }}
                  size="small"
                  sx={{ bgcolor: "#e2e8f0" }}
                />
              );
            })}

            <Button
              size="small"
              onClick={() => {
                setFilterCollection([]);
                updateUrlParams("collection", []);
                setPage(0);
              }}
              sx={{ textTransform: "none", fontSize: "0.85rem" }}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600, color: "#475569", minWidth: 200 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Featured</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Created At</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "#475569" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-500 font-medium">
                        No products found
                      </p>
                      <p className="text-slate-400 text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.id || product._id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell sx={{ minWidth: 200 }}>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={product.icon?.url || (product as any).media?.mainImage}
                          variant="rounded"
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            flexShrink: 0,
                          }}
                        >
                          {(product.productInfo?.title || product.productInfo?.name || "P").charAt(0)}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-800 line-clamp-2">
                              {product.productInfo?.title || product.productInfo?.name || "Untitled Product"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-700">
                        {getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{" "}
                        {product.displayPrice || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", color: "#64748b" }}>
                      {product.isBundle ? "Bundle" : ((product as any).category?.name || "None")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          (product as any).isActive ? "Active" : "Inactive"
                        }
                        size="small"
                        color={
                          (product as any).isActive ? "success" : "default"
                        }
                        variant="outlined"
                        onClick={() => handleToggleStatus((product.id || product._id)!)}
                        sx={{
                          cursor: "pointer",
                          height: 24,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() =>
                          canEdit && handleToggleFeatured((product.id || product._id)!)
                        }
                        sx={{
                          color: (product as any).isFeatured
                            ? "#fbbf24"
                            : "#cbd5e1",
                          cursor: canEdit ? "pointer" : "default",
                        }}
                        disabled={!canEdit}
                      >
                        {(product as any).isFeatured ? (
                          <StarIcon />
                        ) : (
                          <StarBorderIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{new Date(product.createdAt!).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          size="small"
                          onClick={() =>
                            router.push(
                              `/manage-products/product-list/${product.id || product._id}`
                            )
                          }
                          sx={{ color: "#64748b" }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          href={`${storeDomain}/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ color: "#10b981" }}
                          title="View Live"
                        >
                          <PublicIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            router.push(
                              product.isBundle || 
                              (product as any).is_bundle || 
                              product.productStructureType === 'bundle' || 
                              product.productStructureType === 'BUNDLE' ||
                              (product.bundleItems && product.bundleItems.length > 0)
                                ? `/manage-products/add-bundle?id=${product.id || product._id}`
                                : `/manage-products/create-product?id=${product.id || product._id}&from=list`
                            )
                          }
                          sx={{ color: "#3b82f6" }}
                          disabled={!canEdit}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete((product.id || product._id)!)}
                          sx={{ color: "#ef4444" }}
                          disabled={!canEdit}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ borderTop: "1px solid #e2e8f0" }}
        />
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: { borderRadius: "12px", p: 1 }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ color: "#64748b" }}>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={isDeleting}
            sx={{ 
              color: "#64748b", 
              textTransform: "none", 
              fontWeight: 600,
              "&:hover": { bgcolor: "#f1f5f9" }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            disabled={isDeleting}
            autoFocus
            sx={{ 
              bgcolor: "#ef4444", 
              "&:hover": { bgcolor: "#dc2626" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3
            }}
          >
            {isDeleting ? <CircularProgress size={20} color="inherit" /> : "Delete Product"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
