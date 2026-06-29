"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Autocomplete,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingBag as ShoppingBagIcon,
} from "@mui/icons-material";
import { productsApi, Product } from "@/services/products.api";
import { settingsApi } from "@/services/settings.api";
import { getCurrencySymbol } from "@/utils/currencyUtils";

interface BundleProductsStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function BundleProductsStep({
  formData,
  setFormData,
}: BundleProductsStepProps) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
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

  // Ensure all bundle products have unique IDs
  useEffect(() => {
    const bundleProducts = formData.bundleProducts || [];
    let hasUpdates = false;

    const updatedBundleProducts = bundleProducts.map((bp: any) => {
      if (!bp.id) {
        hasUpdates = true;
        return {
          ...bp,
          id: Date.now() + Math.random(),
        };
      }
      return bp;
    });

    if (hasUpdates) {
      setFormData({
        ...formData,
        bundleProducts: updatedBundleProducts,
      });
    }
  }, [formData.bundleProducts?.length]);

  const fetchProducts = async (search?: string) => {
    try {
      setLoadingProducts(true);
      const response = await productsApi.getAllProducts({
        limit: 100,
        search: search || undefined,
        isActive: true, // Only show active products
      });
      setAllProducts(response.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const addBundleProduct = () => {
    const bundleProducts = formData.bundleProducts || [];
    const newBundleProduct = {
      id: Date.now() + Math.random(), // Unique ID for stable React keys
      product: null,
      quantity: 1,
    };

    setFormData({
      ...formData,
      bundleProducts: [...bundleProducts, newBundleProduct],
    });
  };

  const updateBundleProduct = (index: number, field: string, value: any) => {
    const bundleProducts = [...(formData.bundleProducts || [])];
    bundleProducts[index] = {
      ...bundleProducts[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      bundleProducts,
    });
  };

  const deleteBundleProduct = (index: number) => {
    const bundleProducts = [...(formData.bundleProducts || [])];
    bundleProducts.splice(index, 1);

    setFormData({
      ...formData,
      bundleProducts,
    });
  };

  // Get available products for a specific dropdown, excluding already-selected products
  const getAvailableProducts = (currentIndex: number): Product[] => {
    const selectedProductIds = bundleProducts
      .map((bp: any, idx: number) => (idx !== currentIndex ? bp.product : null))
      .filter(Boolean);

    return allProducts.filter((p) => !selectedProductIds.includes(p.id));
  };

  const getProductDetails = (productId: string): Product | null => {
    return allProducts.find((p) => p.id === productId) || null;
  };

  const getProductPrice = (product: Product | null): number => {
    if (!product) return 0;

    // Check for variants with prices
    const productWithVariants = product as any;
    if (
      productWithVariants.variants &&
      productWithVariants.variants.length > 0
    ) {
      // Find the first variant with a price
      const variantWithPrice = productWithVariants.variants.find(
        (v: any) => v.price && v.price > 0
      );
      if (variantWithPrice) {
        return variantWithPrice.price;
      }
    }

    // Check for base price in pricing object
    if (product.pricing?.basePrice) {
      return product.pricing.basePrice;
    }

    return 0;
  };

  const calculateBundleTotalPrice = (): number => {
    return bundleProducts.reduce((total: number, bp: any) => {
      const product = bp.product ? getProductDetails(bp.product) : null;
      const productPrice = getProductPrice(product);
      const quantity = bp.quantity || 0;
      return total + productPrice * quantity;
    }, 0);
  };

  const bundleProducts = formData.bundleProducts || [];

  // Only show if bundle product type
  if (formData.productStructureType !== "bundle") {
    return (
      <Box>
        <Alert severity="info">
          Bundle products are only applicable for bundle/package type products.
          Please select "Bundle/Package" in the Basic Info step to add products
          to the bundle.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#667eea", fontSize: "0.95rem" }}
        >
          Bundle Products
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Select products to include in this bundle.
        </Typography>
      </Box>

      <Stack spacing={2}>
        {/* Bundle Products List */}
        {bundleProducts.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Products in Bundle ({bundleProducts.length})
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                gap: 2,
              }}
            >
              {bundleProducts.map((bundleProduct: any, index: number) => {
                const product = bundleProduct.product
                  ? getProductDetails(bundleProduct.product)
                  : null;

                return (
                  <Paper
                    key={bundleProduct.id || index}
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      backgroundColor: "background.paper",
                      position: "relative",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "primary.light",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: "primary.lighter",
                            color: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ShoppingBagIcon fontSize="small" />
                        </Box>
                        <Typography variant="subtitle2" fontWeight="600">
                          Product {index + 1}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteBundleProduct(index)}
                        sx={{
                          mt: -0.5,
                          mr: -0.5,
                          "&:hover": {
                            backgroundColor: "error.lighter",
                            color: "error.main",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Stack spacing={2}>
                      <Autocomplete
                        options={getAvailableProducts(index)}
                        value={product}
                        onChange={(event, value) => {
                          updateBundleProduct(
                            index,
                            "product",
                            value?.id || null
                          );
                        }}
                        loading={loadingProducts}
                        getOptionLabel={(option) =>
                          option.productInfo?.title || "Unknown Product"
                        }
                        renderOption={(props, option) => {
                          const { key, ...otherProps } = props;
                          return (
                            <Box component="li" key={key} {...otherProps}>
                              <Box>
                                <Typography variant="body2">
                                  {option.productInfo?.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {option.productInfo?.brand} |{" "}
                                  {option.productInfo?.productType}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label="Select Product *"
                            placeholder="Search..."
                            required
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingProducts ? (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />

                      <TextField
                        label="Quantity"
                        size="small"
                        type="number"
                        value={bundleProduct.quantity || 1}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value) || 1;
                          updateBundleProduct(
                            index,
                            "quantity",
                            Math.max(1, quantity)
                          );
                        }}
                        fullWidth
                        required
                        inputProps={{ min: 1 }}
                      />

                      {product && (
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: "background.default",
                            borderRadius: 1,
                            border: "1px dashed",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="body2" fontWeight="500" noWrap>
                            {product.productInfo?.title}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mt: 1 }}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Chip
                              label={product.productInfo?.brand}
                              size="small"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                            <Chip
                              label={product.productInfo?.productType}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Add Product Button */}
        <Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={addBundleProduct}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontSize: "0.8rem",
              py: 0.5,
            }}
          >
            Add Product to Bundle
          </Button>
        </Box>

        {/* Validation */}
        {bundleProducts.length === 0 && (
          <Alert severity="warning">
            <Typography variant="body2" fontWeight="600">
              At least 1 product is required for a bundle
            </Typography>
          </Alert>
        )}

        {/* Help Text */}
        {bundleProducts.length === 0 && (
          <Alert severity="info">
            <Typography variant="body2" fontWeight="600" gutterBottom>
              No products added yet
            </Typography>
            <Typography variant="body2">
              Click "Add Product to Bundle" to start building your product
              package. For example, you could create a "Complete Office Suite"
              bundle with Microsoft Office + Antivirus + Backup Software.
            </Typography>
          </Alert>
        )}

        {/* Bundle Summary */}
        {bundleProducts.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 2,
              backgroundColor: "background.default",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
              Bundle Summary
            </Typography>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Total Products: {bundleProducts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Units:{" "}
                {bundleProducts.reduce(
                  (acc: number, curr: any) => acc + (curr.quantity || 0),
                  0
                )}
              </Typography>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2" fontWeight="600">
                Estimated Cost
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight="700">
                {getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}
                {bundleProducts.reduce((acc: number, curr: any) => {
                  const product = curr.product
                    ? getProductDetails(curr.product)
                    : null;
                  const price =
                    (product?.productInfo as any)?.pricing?.price ||
                    (product?.productInfo as any)?.pricing?.basePrice ||
                    0;
                  return acc + price * (curr.quantity || 1);
                }, 0)}
              </Typography>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
