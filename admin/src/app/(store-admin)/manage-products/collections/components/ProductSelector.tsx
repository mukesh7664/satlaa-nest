"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  Checkbox,
  Typography,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  Chip,
  Stack,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import Image from "next/image";
import { settingsApi } from "@/services/settings.api";
import { getCurrencySymbol } from "@/utils/currencyUtils";

const GridItem = Grid as any;

interface Product {
  _id: string;
  productInfo?: {
    title: string;
    brand?: string;
  };
  slug: string;
  icon?: {
    url: string;
    alt?: string;
  };
  images?: Array<{ url: string; alt?: string; position?: number }>;
  simplePricing?: {
    basePrice?: number;
    discountedPrice?: number;
    currency?: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
}

interface ProductSelectorProps {
  open: boolean;
  onClose: () => void;
  onAdd: (productIds: string[]) => void;
  excludeProductIds?: string[];
}

export default function ProductSelector({
  open,
  onClose,
  onAdd,
  excludeProductIds = [],
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsApi.getSettings();
        setStoreSettings(settings);
      } catch (error) {
        console.error("Failed to fetch store settings:", error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (open) {
      fetchProducts();
      setSelectedIds(new Set());
    }
  }, [open]);

  const fetchProducts = async (search?: string) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
      const token = localStorage.getItem("token");

      const queryParams = new URLSearchParams();
      if (search) queryParams.append("search", search);
      queryParams.append("limit", "50");

      const response = await fetch(
        `${apiUrl}/admin/products-manage?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter out products already in collection
        const availableProducts = (data.products || []).filter(
          (p: Product) => !excludeProductIds.includes(p._id)
        );
        setProducts(availableProducts);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p._id)));
    }
  };

  const handleAdd = () => {
    onAdd(Array.from(selectedIds));
  };

  const getImageUrl = (product: Product) => {
    // First try to use icon
    if (product.icon?.url) {
      const iconUrl = product.icon.url;
      // If it's already a full URL (starts with http/https), use it directly
      if (iconUrl.startsWith("http://") || iconUrl.startsWith("https://")) {
        return iconUrl;
      }
      // If it's a relative path, prepend API URL
      if (iconUrl.startsWith("uploads/")) {
        return `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003"
        }/api/v1/${iconUrl}`;
      }
      return iconUrl;
    }

    // Fallback to first image
    if (product.images && product.images.length > 0 && product.images[0].url) {
      const imageUrl = product.images[0].url;
      // If it's already a full URL (starts with http/https), use it directly
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
      }
      // If it's a relative path, prepend API URL
      if (imageUrl.startsWith("uploads/")) {
        return `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003"
        }/api/v1/${imageUrl}`;
      }
      return imageUrl;
    }

    return "/images/place.png";
  };

  const getPrice = (product: Product) => {
    const currency = product.simplePricing?.currency || getCurrencySymbol(storeSettings?.defaultCurrency || "INR");
    if (product.simplePricing?.discountedPrice) {
      return `${currency}${product.simplePricing.discountedPrice.toLocaleString()}`;
    }
    if (product.simplePricing?.basePrice) {
      return `${currency}${product.simplePricing.basePrice.toLocaleString()}`;
    }
    return "Price on request";
  };

  const getProductName = (product: Product) => {
    return product.productInfo?.title || product.slug || "Unnamed Product";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "16px", overflowX: "hidden" },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="700">Add Products to Collection</Typography>
          <Chip
            label={`${selectedIds.size} selected`}
            size="small"
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ overflowX: "hidden" }}>
        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-slate-400" />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              }
            }}
          />
        </Box>

        {/* Select All */}
        {products.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    selectedIds.size === products.length && products.length > 0
                  }
                  indeterminate={
                    selectedIds.size > 0 && selectedIds.size < products.length
                  }
                  onChange={toggleAll}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" fontWeight="600" color="text.secondary">
                  Select all ({products.length} products)
                </Typography>
              }
            />
          </Box>
        )}

        {/* Products List */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : products.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              bgcolor: "#f8fafc",
              borderRadius: "12px",
              border: "1px dashed #e2e8f0",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? "No products found matching your search"
                : "No products available to add"}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 0.5 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <Card
                  key={product._id}
                  sx={{
                    cursor: "pointer",
                    border: selectedIds.has(product._id)
                      ? "2px solid"
                      : "1px solid",
                    borderColor: selectedIds.has(product._id)
                      ? "primary.main"
                      : "#e2e8f0",
                    boxShadow: selectedIds.has(product._id)
                      ? "0 4px 12px rgba(99, 102, 241, 0.08)"
                      : "none",
                    borderRadius: "12px",
                    "&:hover": {
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.04)",
                      borderColor: selectedIds.has(product._id)
                        ? "primary.main"
                        : "#cbd5e1",
                    },
                    transition: "all 0.2s",
                  }}
                  onClick={() => toggleProduct(product._id)}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                      {/* Checkbox */}
                      <Checkbox
                        checked={selectedIds.has(product._id)}
                        onChange={() => toggleProduct(product._id)}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                      />

                      {/* Product Image */}
                      <Box
                        sx={{
                          position: "relative",
                          width: 60,
                          height: 60,
                          flexShrink: 0,
                          bgcolor: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "48px",
                            height: "48px",
                          }}
                        >
                          <Image
                            src={getImageUrl(product)}
                            alt={getProductName(product)}
                            fill
                            style={{ objectFit: "contain" }}
                            unoptimized
                          />
                        </Box>
                      </Box>

                      {/* Product Details */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {product.brand && (
                          <Typography
                            variant="caption"
                            fontWeight="600"
                            sx={{ color: "primary.main", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.5px" }}
                            display="block"
                          >
                            {product.brand.name}
                          </Typography>
                        )}
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          sx={{
                            color: "#1e293b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {getProductName(product)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight="700"
                          sx={{ mt: 0.25, fontSize: "12px" }}
                        >
                          {getPrice(product)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary", textTransform: "none", fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={selectedIds.size === 0}
          sx={{
            bgcolor: "var(--primary)",
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            "&:hover": {
              bgcolor: "var(--primary)",
              filter: "brightness(0.9)",
            },
          }}
        >
          Add {selectedIds.size > 0 ? `(${selectedIds.size})` : ""} Products
        </Button>
      </DialogActions>
    </Dialog>
  );
}
