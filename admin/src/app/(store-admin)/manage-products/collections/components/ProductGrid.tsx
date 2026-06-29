"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { settingsApi } from "@/services/settings.api";
import { getCurrencySymbol } from "@/utils/currencyUtils";

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
  status?: string;
}

interface ProductGridProps {
  products: Product[];
  viewMode: "grid" | "list";
  onRemove?: (productId: string) => void;
  onEdit?: (productId: string) => void;
  onProductClick?: (productSlug: string) => void;
}

export default function ProductGrid({
  products,
  viewMode,
  onRemove,
  onEdit,
  onProductClick,
}: ProductGridProps) {
  const [storeSettings, setStoreSettings] = React.useState<any>(null);

  React.useEffect(() => {
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
      const currentPrice = `${currency}${product.simplePricing.discountedPrice.toLocaleString()}`;
      const originalPrice = product.simplePricing.basePrice && product.simplePricing.basePrice !== product.simplePricing.discountedPrice
        ? `${currency}${product.simplePricing.basePrice.toLocaleString()}`
        : undefined;
      return {
        current: currentPrice,
        original: originalPrice,
      };
    }
    if (product.simplePricing?.basePrice) {
      return {
        current: `${currency}${product.simplePricing.basePrice.toLocaleString()}`,
      };
    }
    return { current: "Price on request" };
  };

  const getProductName = (product: Product) => {
    return product.productInfo?.title || product.slug || "Unnamed Product";
  };

  if (viewMode === "grid") {
    return (
      <Grid container spacing={3}>
        {products.map((product) => {
          const price = getPrice(product);
          return (
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={product._id}
              component="div"
            >
              <Card
                onClick={() => onProductClick && onProductClick(product.slug)}
                sx={{
                  cursor: "pointer",
                  borderRadius: "16px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.06)",
                    transform: "translateY(-4px)",
                    borderColor: "#e2e8f0",
                  },
                }}
              >
                {/* Product Image Box */}
                <Box
                  sx={{
                    position: "relative",
                    height: "200px",
                    bgcolor: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    m: 1,
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "130px",
                      height: "130px",
                      transition: "transform 0.5s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
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

                  {/* Action Buttons */}
                  {(onRemove || onEdit) && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "flex",
                        gap: 0.5,
                        zIndex: 10,
                      }}
                    >
                      {onEdit && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(product._id);
                          }}
                          sx={{
                            bgcolor: "white",
                            color: "#475569",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            "&:hover": { bgcolor: "#f1f5f9", color: "primary.main" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {onRemove && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(product._id);
                          }}
                          sx={{
                            bgcolor: "white",
                            color: "#ef4444",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            "&:hover": {
                              bgcolor: "#fee2e2",
                              color: "#dc2626",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </Box>

                <CardContent sx={{ p: 2, pt: 1, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  {/* Brand & Status row */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    {product.brand ? (
                      <Typography
                        variant="caption"
                        fontWeight="700"
                        sx={{ color: "primary.main", textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.5px" }}
                      >
                        {product.brand.name}
                      </Typography>
                    ) : (
                      <div />
                    )}

                    {product.status && (
                      <Chip
                        label={product.status}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "9px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          bgcolor: product.status === "active" ? "#e2fbe8" : "#f1f5f9",
                          color: product.status === "active" ? "#16a34a" : "#64748b",
                        }}
                      />
                    )}
                  </Stack>

                  {/* Product Name */}
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    sx={{
                      color: "#1e293b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      lineHeight: 1.4,
                      minHeight: "2.8em",
                      mb: 1.5,
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {getProductName(product)}
                  </Typography>

                  {/* Price */}
                  <Box sx={{ mt: "auto" }}>
                    <Stack direction="row" spacing={1} alignItems="baseline">
                      <Typography variant="body1" fontWeight="800" sx={{ color: "#0f172a" }}>
                        {price.current}
                      </Typography>
                      {price.original && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ textDecoration: "line-through", fontSize: "11px", fontWeight: 500 }}
                        >
                          {price.original}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  }

  // List View
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={80}>Image</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Brand</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Status</TableCell>
            {(onRemove || onEdit) && (
              <TableCell align="right">Actions</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => {
            const price = getPrice(product);
            return (
              <TableRow
                key={product._id}
                sx={{
                  cursor: onProductClick ? "pointer" : "default",
                  "&:hover": { bgcolor: "grey.50" },
                }}
                onClick={() => onProductClick && onProductClick(product.slug)}
              >
                {/* Image */}
                <TableCell>
                  <Box
                    sx={{
                      position: "relative",
                      width: 70,
                      height: 70,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        width: "60px",
                        height: "60px",
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
                </TableCell>

                {/* Product Name */}
                <TableCell>
                  <Typography variant="body2" fontWeight="600">
                    {getProductName(product)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.slug}
                  </Typography>
                </TableCell>

                {/* Brand */}
                <TableCell>
                  <Typography variant="body2">
                    {product.brand?.name || "-"}
                  </Typography>
                </TableCell>

                {/* Price */}
                <TableCell>
                  <Typography variant="body2" fontWeight="600">
                    {price.current}
                  </Typography>
                  {price.original && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textDecoration: "line-through" }}
                    >
                      {price.original}
                    </Typography>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  {product.status && (
                    <Chip
                      label={product.status}
                      size="small"
                      color={
                        product.status === "active" ? "success" : "default"
                      }
                    />
                  )}
                </TableCell>

                {/* Actions */}
                {(onRemove || onEdit) && (
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      {onEdit && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(product._id);
                          }}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {onRemove && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(product._id);
                          }}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
