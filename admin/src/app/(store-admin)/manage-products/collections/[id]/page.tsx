"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
  Divider,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { collectionsApi, Collection } from "@/services/collections.api";
import ProductGrid from "../components/ProductGrid";
import ProductSelector from "../components/ProductSelector";

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

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    fetchCollectionDetails();
  }, [collectionId]);

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch collection details
      const response = await collectionsApi.getCollectionById(collectionId);
      setCollection(response.collection);

      // Fetch products in the collection
      await fetchProducts(response.collection);
    } catch (err: any) {
      console.error("Error fetching collection:", err);
      setError(err.message || "Failed to load collection");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (col: Collection) => {
    try {
      // For now, we'll fetch products separately
      // You'll need to add an API endpoint to get products in collection
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${apiUrl}/admin/collections/${collectionId}/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleAddProducts = async (selectedProductIds: string[]) => {
    try {
      await collectionsApi.addProductsToCollection(
        collectionId,
        selectedProductIds
      );
      toast.success("Products added to collection");
      fetchCollectionDetails();
      setSelectorOpen(false);
    } catch (err: any) {
      console.error("Error adding products:", err);
      toast.error(err.message || "Failed to add products");
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      await collectionsApi.removeProductsFromCollection(collectionId, [
        productId,
      ]);
      toast.success("Product removed from collection");
      fetchCollectionDetails();
    } catch (err: any) {
      console.error("Error removing product:", err);
      toast.error(err.message || "Failed to remove product");
    }
  };

  const handleProductClick = (slug: string) => {
    // Open product page in the live website
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
    window.open(`${webUrl}/products/${slug}`, "_blank");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !collection) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || "Collection not found"}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, md: 3 } }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon fontSize="small" />}
        onClick={() => router.push("/manage-products/collections")}
        sx={{
          color: "text.secondary",
          textTransform: "none",
          fontSize: "0.875rem",
          fontWeight: 600,
          "&:hover": {
            color: "primary.main",
            bgcolor: "transparent",
          },
          mb: 3,
        }}
      >
        Back to Collections
      </Button>

      {/* Cover Banner */}
      <Box
        sx={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          height: "220px",
          bgcolor: "#f1f5f9",
          backgroundImage: collection.image
            ? `url(${collection.image})`
            : "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      />

      {/* Info Card Overlay */}
      <Card
        sx={{
          position: "relative",
          mt: "-60px",
          mx: { xs: 2, md: 4 },
          mb: 4,
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid #f1f5f9",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "center", md: "flex-end" },
              textAlign: { xs: "center", md: "left" },
              gap: 3,
              mt: "-80px",
              mb: 2,
            }}
          >
            {/* Avatar Icon */}
            <Avatar
              src={collection.icon}
              variant="rounded"
              sx={{
                width: 100,
                height: 100,
                bgcolor: "#fff",
                border: "4px solid #fff",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                borderRadius: "20px",
              }}
            >
              {collection.name.charAt(0)}
            </Avatar>

            <Box sx={{ flexGrow: 1, pt: { xs: 0, md: 6 } }}>
              <Typography
                variant="h4"
                fontWeight="800"
                sx={{ color: "#1e293b", letterSpacing: "-0.5px" }}
              >
                {collection.name}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{ xs: "center", md: "flex-start" }}
                alignItems="center"
                sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}
              >
                <Chip
                  label={collection.type === "manual" ? "Manual" : "Automatic"}
                  size="small"
                  sx={{
                    bgcolor: collection.type === "manual" ? "#eff6ff" : "#fdf4ff",
                    color: collection.type === "manual" ? "#3b82f6" : "#d946ef",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
                <Chip
                  label={collection.isActive ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    bgcolor: collection.isActive ? "#f0fdf4" : "#f1f5f9",
                    color: collection.isActive ? "#16a34a" : "#64748b",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
                <Chip
                  label={`${products.length} ${
                    products.length === 1 ? "product" : "products"
                  }`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    fontWeight: 500,
                    fontSize: "0.75rem",
                  }}
                />
              </Stack>
            </Box>

            <Box sx={{ mt: { xs: 2, md: 0 } }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push("/manage-products/collections")}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  borderColor: "#cbd5e1",
                  color: "#475569",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  "&:hover": {
                    borderColor: "#94a3b8",
                    bgcolor: "#f8fafc",
                  },
                }}
              >
                Manage Collections
              </Button>
            </Box>
          </Box>

          {collection.description && (
            <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #f1f5f9" }}>
              <Typography
                variant="body1"
                sx={{ color: "#475569", lineHeight: 1.6 }}
              >
                {collection.description}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Rules Display for Automatic Collections */}
      {collection.type === "automatic" && collection.rules && (
        <Card
          sx={{
            mb: 4,
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
            border: "1px solid #e2e8f0",
            bgcolor: "#f8fafc",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              fontWeight="700"
              sx={{ color: "#1e293b", mb: 1 }}
            >
              Collection Rules
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Products are automatically added based on these conditions:
            </Typography>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ flexWrap: "wrap", gap: 1 }}
            >
              <Typography
                variant="body2"
                fontWeight="600"
                sx={{ color: "#475569" }}
              >
                Tags:
              </Typography>
              {collection.rules.tags && collection.rules.tags.length > 0 ? (
                <Chip
                  label={`${collection.rules.tags.length} tag${
                    collection.rules.tags.length > 1 ? "s" : ""
                  }`}
                  size="small"
                  sx={{
                    bgcolor: "#e2fbe8",
                    color: "#16a34a",
                    fontWeight: 600,
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No tags set
                </Typography>
              )}
              <Chip
                label={
                  collection.rules.conditions === "all"
                    ? "Match ALL tags"
                    : "Match ANY tag"
                }
                size="small"
                variant="outlined"
                sx={{
                  borderColor: "#cbd5e1",
                  color: "#475569",
                  fontWeight: 500,
                }}
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Products Section */}
      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 25px rgba(0, 0, 0, 0.02)",
          border: "1px solid #e2e8f0",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight="700"
                sx={{ color: "#1e293b" }}
              >
                Products ({products.length})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage products associated with this collection
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                alignSelf: { xs: "stretch", sm: "auto" },
                justifyContent: "space-between",
              }}
            >
              {/* View Mode Toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newView) => {
                  if (newView !== null) setViewMode(newView);
                }}
                size="small"
                sx={{
                  bgcolor: "#f1f5f9",
                  p: 0.5,
                  borderRadius: "8px",
                  border: "none",
                  "& .MuiToggleButton-root": {
                    border: "none",
                    borderRadius: "6px",
                    px: 1.5,
                    py: 0.5,
                    color: "#64748b",
                    "&.Mui-selected": {
                      bgcolor: "#fff",
                      color: "primary.main",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      "&:hover": {
                        bgcolor: "#fff",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="grid">
                  <GridViewIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Add Products Button */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setSelectorOpen(true)}
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
                Add Products
              </Button>
            </Stack>
          </Box>

          {/* Products Display */}
          {products.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                bgcolor: "#f8fafc",
                borderRadius: "12px",
                border: "1px dashed #e2e8f0",
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                No products in this collection
              </Typography>
              {collection.type === "manual" ? (
                <>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Click "Add Products" to start building your collection
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setSelectorOpen(true)}
                    sx={{
                      bgcolor: "var(--primary)",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      mt: 1,
                      "&:hover": {
                        bgcolor: "var(--primary)",
                        filter: "brightness(0.9)",
                      },
                    }}
                  >
                    Add Products
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No products match the current rules. Try adjusting your tag
                  conditions.
                </Typography>
              )}
            </Box>
          ) : (
            <ProductGrid
              products={products}
              viewMode={viewMode}
              onRemove={handleRemoveProduct}
              onProductClick={handleProductClick}
            />
          )}
        </CardContent>
      </Card>

      {/* Product Selector Dialog */}
      <ProductSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onAdd={handleAddProducts}
        excludeProductIds={products.map((p) => p._id)}
      />
    </Container>
  );
}
