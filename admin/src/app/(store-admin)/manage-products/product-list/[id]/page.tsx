"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Paper,
  Divider,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableHead,
  Tabs,
  Tab,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
} from "@mui/material";
import {
  Store as StoreIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  MonetizationOn as MonetizationOnIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  PermMedia as MediaIcon,
  ListAlt as DetailsIcon,
  Extension as DynamicIcon,
  QrCode as QrCodeIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  RateReview as RateReviewIcon,
  Delete as DeleteIcon,
  StarOutline as StarOutlineIcon,
  ThumbsUpDown as ThumbsUpDownIcon,
  ThumbUp as ThumbUpIcon,
} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import { productsApi, Product } from "@/services/products.api";
import { adminApi } from "@/services/admin.api";
import { settingsApi } from "@/services/settings.api";
import { getCurrencySymbol } from "@/utils/currencyUtils";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Tooltip from "@mui/material/Tooltip";

const GridItem = Grid as any;

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [creatorName, setCreatorName] = useState<string>("");
  const [storeDomain, setStoreDomain] = useState<string>("localhost:3000");
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


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (id) {
      fetchProductDetails(id as string);
    }
  }, [id]);

  useEffect(() => {

  }, [activeTab]);



  const fetchProductDetails = async (productId: string) => {
    try {
      setLoading(true);
      const fetchedProduct = await productsApi.getProductById(productId);
      setProduct(fetchedProduct);

      // Fetch store domain for View Live button
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
      } catch (domainErr) {
        console.error("Failed to fetch store domains:", domainErr);
        setStoreDomain(process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000");
      }

      // Fetch creator details if addedBy exists
      if (fetchedProduct.addedBy) {
        // If it looks like an ID (24 chars), fetch it
        if (fetchedProduct.addedBy.length === 24) {
          try {
            const adminUser = await adminApi.getAdminById(
              fetchedProduct.addedBy
            );
            setCreatorName(adminUser.name);
          } catch (err) {
            console.error("Failed to fetch creator details:", err);
            setCreatorName(fetchedProduct.addedBy); // Fallback to ID
          }
        } else {
          // Assuming it's already a name or object?
          // If it's an object, we need to handle it. For now assume string.
          setCreatorName(fetchedProduct.addedBy);
        }
      }

    } catch (error) {
      console.error("Failed to fetch product details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container>
        <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
          Product not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          px: 3,
          py: 2,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          mx: -3, // Negative margin to stretch full width within Container
          mt: -4, // Negative margin to pull to top
          pt: 3, // Compensate top padding
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Back">
            <IconButton
              onClick={() => router.push("/manage-products/product-list")}
              sx={{ color: "text.secondary" }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={product.productInfo?.title || "Untitled Product"}>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                display: "-webkit-box",
                overflow: "hidden",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 1,
                maxWidth: 600,
              }}
            >
              {product.productInfo?.title || "Untitled Product"}
            </Typography>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            href={`${storeDomain}/products/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "text.primary",
                bgcolor: "background.default",
              },
            }}
          >
            View Live
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() =>
              router.push(
                product.isBundle || 
                (product as any).is_bundle || 
                product.productStructureType === 'bundle' || 
                product.productStructureType === 'BUNDLE' ||
                (product.bundleItems && product.bundleItems.length > 0)
                  ? `/manage-products/add-bundle?id=${product.id || product._id}`
                  : `/manage-products/create-product?id=${product.id || product._id}&from=detail`
              )
            }
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              },
            }}
          >
            Edit Product
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: '#667eea',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              minWidth: 120,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: '#667eea',
              },
            },
          }}
        >
          {product.isBundle ? [
            <Tab key="info" icon={<InfoIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Bundle Info" />,
            <Tab key="media" icon={<MediaIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Media" />,
            <Tab key="details" icon={<DetailsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Product Details" />,
            <Tab key="seo" icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="SEO & Final Settings" />,
            <Tab key="qr" icon={<QrCodeIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Product QR Code" />,
            <Tab key="reviews" icon={<RateReviewIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Customer Reviews" />,
          ] : [
            <Tab key="basic" icon={<InfoIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Basic Info" />,
            <Tab key="dynamic" icon={<DynamicIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Dynamic Fields" />,
            <Tab key="inventory" icon={<InventoryIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Inventory & Variants" />,
            <Tab key="media" icon={<MediaIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Media" />,
            <Tab key="details" icon={<DetailsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Product Details" />,
            <Tab key="seo" icon={<SettingsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="SEO & Final Settings" />,
            <Tab key="qr" icon={<QrCodeIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Product QR Code" />,
            <Tab key="reviews" icon={<RateReviewIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Customer Reviews" />,
          ]}
        </Tabs>
      </Box>

      <Box sx={{ minHeight: '60vh' }}>
        {/* Tab 0: Basic Info or Bundle Info */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {product.isBundle ? (
              <>
                <GridItem size={{ xs: 12, md: 8 }}>
                  <Card sx={{ borderRadius: 4, mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" fontWeight="700" color="#667eea" gutterBottom>
                        Products in this Bundle
                      </Typography>
                      <Divider sx={{ mb: 3 }} />
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Subtotal</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {product.bundleItems?.map((item: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2, display: 'flex' }}>
                                      <img src={item.mainImage || "/placeholder.png"} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover' }} />
                                    </Paper>
                                    <Typography variant="body2" fontWeight="600">{item.name}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">{item.quantity}</TableCell>
                                <TableCell align="right">{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{item.price}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{item.price * item.quantity}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </GridItem>
                <GridItem size={{ xs: 12, md: 4 }}>
                  <Stack spacing={3}>
                    <Card sx={{ borderRadius: 4, p: 3, bgcolor: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                      <Typography variant="subtitle2" fontWeight="700" color="#667eea" gutterBottom sx={{ textTransform: 'uppercase' }}>
                        Bundle Value Summary
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Total Value:</Typography>
                          <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                            {getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{product.bundleItems?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="700">Combo Price:</Typography>
                          <Typography variant="h5" fontWeight="800" color="primary">
                            {getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{product.price || product.simplePricing?.basePrice}
                          </Typography>
                        </Box>
                        <Alert icon={false} severity="success" sx={{ borderRadius: 2, fontWeight: '700' }}>
                          Save {getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{product.bundleItems?.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) - (product.price || product.simplePricing?.basePrice)} on this bundle!
                        </Alert>
                      </Stack>
                    </Card>
                  </Stack>
                </GridItem>
              </>
            ) : (
              <GridItem size={{ xs: 12 }}>
                <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="700" color="#667eea" gutterBottom>
                      Basic Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={4}>
                      <GridItem size={{ xs: 12, md: 8 }}>
                        <Stack spacing={3}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>
                              Product Title
                            </Typography>
                            <Typography variant="h5" fontWeight="600" sx={{ mt: 0.5 }}>
                              {product.productInfo?.title || product.title || "N/A"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>
                              Product Description
                            </Typography>
                            <Box sx={{
                              mt: 1,
                              p: 2,
                              bgcolor: '#f8fafc',
                              borderRadius: 2,
                              border: '1px solid #e2e8f0',
                              minHeight: '100px'
                            }}>
                              <div dangerouslySetInnerHTML={{ __html: product.productInfo?.description || product.description || "No description provided." }} />
                            </Box>
                          </Box>
                        </Stack>
                      </GridItem>
                      <GridItem size={{ xs: 12, md: 4 }}>
                        <Stack spacing={3}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#f1f5f9' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>
                              Selected Category
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CategoryIcon color="primary" />
                              <Typography fontWeight="600">
                                {product.category?.name || (typeof product.category === 'string' ? product.category : "N/A")}
                              </Typography>
                            </Box>
                          </Paper>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ textTransform: 'uppercase' }}>
                              HSN Code
                            </Typography>
                            <Typography variant="h6" fontWeight="600" sx={{ mt: 0.5 }}>
                              {product.productInfo?.hsn_code || product.hsn_code || "N/A"}
                            </Typography>
                          </Paper>
                        </Stack>
                      </GridItem>
                    </Grid>
                  </CardContent>
                </Card>
              </GridItem>
            )}
          </Grid>
        )}

        {/* Dynamic Fields - Regular Product Index 1 */}
        {!product.isBundle && activeTab === 1 && (
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="700" color="#667eea" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DynamicIcon /> Dynamic Specifications
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {product.attributes && Object.keys(product.attributes).length > 0 ? (
                <Grid container spacing={4}>
                  {Object.entries(product.attributes)
                    .filter(([key]) => !['size', 'color'].includes(key.toLowerCase()))
                    .map(([key, value]: [string, any]) => (
                      <GridItem size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                        <Box sx={{
                          p: 2,
                          bgcolor: 'rgba(102, 126, 234, 0.05)',
                          borderRadius: 3,
                          border: '1px solid rgba(102, 126, 234, 0.1)'
                        }}>
                          <Typography variant="caption" fontWeight="bold" color="#667eea" sx={{ textTransform: 'uppercase' }}>
                            {key.replace(/_/g, ' ')}
                          </Typography>
                          <Typography variant="body1" fontWeight="600" sx={{ mt: 0.5 }}>
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </Typography>
                        </Box>
                      </GridItem>
                    ))}
                </Grid>
              ) : <Typography variant="body1" color="text.secondary" align="center">No dynamic attributes found.</Typography>}
            </CardContent>
          </Card>
        )}

        {/* Inventory - Regular Product Index 2 */}
        {!product.isBundle && activeTab === 2 && (
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="700" color="#667eea" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon /> Inventory & Variants
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {(product.productPricingType === "variant" || (product.variants && product.variants.length > 0)) ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: '700' }}>Variant</TableCell>
                        <TableCell sx={{ fontWeight: '700' }}>SKU</TableCell>
                        <TableCell sx={{ fontWeight: '700' }}>Cost Price</TableCell>
                        <TableCell sx={{ fontWeight: '700' }}>Base Price</TableCell>
                        <TableCell sx={{ fontWeight: '700' }}>GST</TableCell>
                        <TableCell sx={{ fontWeight: '700' }}>Final Price</TableCell>
                        <TableCell sx={{ fontWeight: '700' }}>Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {product.variants?.map((v: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{v.name || v.title || v.combo}</TableCell>
                          <TableCell>{v.sku || v.skuPrefix}</TableCell>
                          <TableCell>{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{v.costPrice ?? v.cost_price ?? 0}</TableCell>
                          <TableCell>{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{v.price}</TableCell>
                          <TableCell>{product.productInfo?.tax_rate || product.tax_rate || 0}%</TableCell>
                          <TableCell sx={{ fontWeight: '700' }}>
                            {getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}
                            {(v.price * (1 + (product.productInfo?.tax_rate || product.tax_rate || 0) / 100)).toFixed(2)}
                          </TableCell>
                          <TableCell><Chip label={v.stock > 0 ? `${v.stock} pcs` : 'Out of Stock'} size="small" color={v.stock > 0 ? "success" : "error"} variant="outlined" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 4, bgcolor: '#f9fafb', borderRadius: 4, border: '1px dashed #e5e7eb' }}>
                  <Typography variant="subtitle1" fontWeight="700" gutterBottom align="center">Simple Product Details</Typography>
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <GridItem size={{ xs: 6, md: 2 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">SKU</Typography>
                      <Typography variant="body1" fontWeight="700">{product.simplePricing?.sku || product.sku || 'N/A'}</Typography>
                    </GridItem>
                    <GridItem size={{ xs: 6, md: 2 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">COST PRICE</Typography>
                      <Typography variant="body1" fontWeight="700">{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{product.simplePricing?.costPrice ?? product.costPrice ?? '0'}</Typography>
                    </GridItem>
                    <GridItem size={{ xs: 6, md: 2 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">BASE PRICE</Typography>
                      <Typography variant="body1" fontWeight="700">{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{product.simplePricing?.basePrice || product.price || '0'}</Typography>
                    </GridItem>
                    <GridItem size={{ xs: 6, md: 2 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">GST RATE</Typography>
                      <Typography variant="body1" fontWeight="700">{product.productInfo?.tax_rate || product.tax_rate || 0}%</Typography>
                    </GridItem>
                    <GridItem size={{ xs: 6, md: 2 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">FINAL PRICE</Typography>
                      <Typography variant="body1" fontWeight="700" color="primary">
                        {getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{(parseFloat(String(product.simplePricing?.basePrice || product.price || 0)) * (1 + (product.productInfo?.tax_rate || product.tax_rate || 0) / 100)).toFixed(2)}
                      </Typography>
                    </GridItem>
                    <GridItem size={{ xs: 6, md: 2 }} sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">STOCK</Typography>
                      <Typography variant="body1" fontWeight="700" color={(product.simplePricing?.stockQuantity || product.stock) > 0 ? 'success.main' : 'error.main'}>
                        {product.simplePricing?.stockQuantity || product.stock || '0'}
                      </Typography>
                    </GridItem>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Media - Standard Index 3, Bundle Index 1 */}
        {((!product.isBundle && activeTab === 3) || (product.isBundle && activeTab === 1)) && (
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="700" color="#667eea" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MediaIcon /> Product Gallery
              </Typography>
              <Divider sx={{ mb: 4 }} />
              <Grid container spacing={2}>
                {product.images?.map((img: any, idx: number) => (
                  <GridItem size={{ xs: 6, sm: 4, md: 3 }} key={idx}>
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', aspectRatio: '1/1', border: '1px solid #eee', bgcolor: '#fafafa', display: 'flex', position: 'relative' }}>
                      <img src={img.url || img.fullUrl} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {img.is_main && (<Chip label="MAIN" size="small" sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(102,126,234,0.9)', color: '#fff', fontWeight: 'bold', height: 20 }} />)}
                    </Paper>
                  </GridItem>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Detailed Info - Standard Index 4, Bundle Index 2 */}
        {((!product.isBundle && activeTab === 4) || (product.isBundle && activeTab === 2)) && (
          <Box>
            {/* Banner Showcase */}
            {product.productDetails?.banner?.image && (
              <Box sx={{ mb: 3, borderRadius: 4, overflow: 'hidden', position: 'relative', height: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Box
                  component="img"
                  src={product.productDetails.banner.image}
                  alt={product.productDetails.banner.alt || "Banner image"}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {(product.productDetails.banner.title || product.productDetails.banner.subtitle) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#fff',
                      textAlign: 'center',
                      p: 2
                    }}
                  >
                    {product.productDetails.banner.title && (
                      <Typography variant="h5" fontWeight="800" sx={{ mb: 1 }}>
                        {product.productDetails.banner.title}
                      </Typography>
                    )}
                    {product.productDetails.banner.subtitle && (
                      <Typography variant="body2">
                        {product.productDetails.banner.subtitle}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}

            <Grid container spacing={3}>
              {/* Left Column - Rich Description, Overview, Specifications, FAQs */}
              <GridItem size={{ xs: 12, md: 8 }}>
                <Stack spacing={3}>
                  <Card sx={{ borderRadius: 4 }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h6" fontWeight="700" gutterBottom>Rich Description</Typography>
                      <Divider sx={{ mb: 2 }} />
                      <div dangerouslySetInnerHTML={{ __html: product.description }} style={{ color: '#4b5563', lineHeight: 1.7 }} />
                    </CardContent>
                  </Card>

                  {/* Overview */}
                  {product.productDetails?.overview?.enabled !== false && product.productDetails?.overview?.content && (
                    <Card sx={{ borderRadius: 4 }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" fontWeight="700" color="#667eea" gutterBottom>
                          {product.productDetails.overview.title || "Overview"}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {product.productDetails.overview.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                  {/* Specifications */}
                  {product.productDetails?.specifications?.enabled !== false && (
                    (product.productDetails?.specifications?.items && product.productDetails.specifications.items.length > 0) ||
                    (product.productDetails?.specifications?.columns && product.productDetails.specifications.columns.length > 0)
                  ) && (
                    <Card sx={{ borderRadius: 4 }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" fontWeight="700" color="#667eea" gutterBottom>
                          {product.productDetails.specifications.title || "Specifications"}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                          <Table size="small">
                            <TableHead sx={{ bgcolor: 'rgba(102, 126, 234, 0.05)' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: '700' }}>Specification</TableCell>
                                <TableCell sx={{ fontWeight: '700' }}>Value</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {/* Render items if present */}
                              {product.productDetails.specifications.items?.map((item: any, idx: number) => (
                                <TableRow key={`item-${idx}`}>
                                  <TableCell sx={{ fontWeight: '500' }}>{item.title}</TableCell>
                                  <TableCell>{item.value}</TableCell>
                                </TableRow>
                              ))}
                              {/* Render columns if present */}
                              {product.productDetails.specifications.columns?.flatMap((col: any) => col || [])?.map((item: any, idx: number) => (
                                <TableRow key={`col-${idx}`}>
                                  <TableCell sx={{ fontWeight: '500' }}>{item.title || item.key}</TableCell>
                                  <TableCell>{item.value}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* FAQs */}
                  {product.productDetails?.faq?.enabled !== false && product.productDetails?.faq?.questions && product.productDetails.faq.questions.length > 0 && (
                    <Card sx={{ borderRadius: 4 }}>
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h6" fontWeight="700" color="#667eea" gutterBottom>
                          {product.productDetails.faq.title || "Frequently Asked Questions"}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                          {product.productDetails.faq.questions.map((faq: any, idx: number) => (
                            <Box key={idx} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                              <Typography variant="subtitle2" fontWeight="700" color="text.primary" gutterBottom>
                                Q: {faq.question}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                {faq.answer}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </GridItem>

              {/* Right Column - Features & Checklist, Why Choose Us, Highlights */}
              <GridItem size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>
                  {/* Features & Checklist */}
                  {product.productDetails?.features?.enabled !== false && (
                    (product.productDetails?.features?.featurePoints && product.productDetails.features.featurePoints.length > 0) ||
                    (product.productDetails?.features?.checklist && product.productDetails.features.checklist.length > 0)
                  ) && (
                    <Card sx={{ borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight="700" gutterBottom>
                          {product.productDetails.features.title || "Product Features"}
                        </Typography>
                        {product.productDetails.features.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                            {product.productDetails.features.description}
                          </Typography>
                        )}
                        
                        {product.productDetails.features.featurePoints && product.productDetails.features.featurePoints.length > 0 && (
                          <Stack spacing={1.5}>
                            {product.productDetails.features.featurePoints.map((f: any, idx: number) => (
                              <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                <CheckCircleIcon color="success" sx={{ fontSize: 18, mt: 0.5 }} />
                                <Typography variant="body2">
                                  {typeof f === 'string' ? f : (
                                    <>
                                      <Box component="span" sx={{ fontWeight: 600 }}>{f.title}</Box>
                                      {f.content && ` - ${f.content}`}
                                    </>
                                  )}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        )}

                        {product.productDetails.features.checklist && product.productDetails.features.checklist.length > 0 && (
                          <>
                            {(product.productDetails.features.featurePoints || []).length > 0 && <Divider sx={{ my: 2 }} />}
                            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', color: 'text.secondary' }}>
                              Checklist
                            </Typography>
                            <Stack spacing={1}>
                              {product.productDetails.features.checklist.map((item: string, idx: number) => (
                                <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  <CheckCircleIcon color="primary" sx={{ fontSize: 16 }} />
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{item}</Typography>
                                </Box>
                              ))}
                            </Stack>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Why Choose Us */}
                  {product.productDetails?.whyChoose?.enabled !== false && product.productDetails?.whyChoose?.points && product.productDetails.whyChoose.points.length > 0 && (
                    <Card sx={{ borderRadius: 4, border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight="700" color="#667eea" gutterBottom>
                          {product.productDetails.whyChoose.title || "Why Choose Us"}
                        </Typography>
                        <Stack spacing={2} sx={{ mt: 1.5 }}>
                          {product.productDetails.whyChoose.points.map((p: any, idx: number) => (
                            <Box key={idx}>
                              <Typography variant="body2" fontWeight="700" color="text.primary">
                                • {typeof p === 'string' ? p : p.title}
                              </Typography>
                              {typeof p !== 'string' && p.content && (
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ pl: 2, mt: 0.5 }}>
                                  {p.content}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  )}

                  {/* Product Highlights / Points */}
                  {product.productDetails?.productPoints?.enabled !== false && product.productDetails?.productPoints?.points && product.productDetails.productPoints.points.length > 0 && (
                    <Card sx={{ borderRadius: 4, bgcolor: 'rgba(118, 75, 162, 0.02)', border: '1px dashed rgba(118, 75, 162, 0.2)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight="700" color="#764ba2" gutterBottom>
                          {product.productDetails.productPoints.title || "Product Highlights"}
                        </Typography>
                        <Stack spacing={1} sx={{ mt: 1.5 }}>
                          {product.productDetails.productPoints.points.map((pt: string, idx: number) => (
                            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#764ba2', mt: 1, mr: 1, flexShrink: 0 }} />
                              <Typography variant="body2">{pt}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </GridItem>
            </Grid>
          </Box>
        )}

        {/* SEO - Standard Index 5, Bundle Index 3 */}
        {((!product.isBundle && activeTab === 5) || (product.isBundle && activeTab === 3)) && (
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 3 }}>
                  Search Engine Optimization (SEO)
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={3}>
                  <Box p={2.5} sx={{ bgcolor: 'rgba(102, 126, 234, 0.03)', borderRadius: 3, border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                    <Typography variant="caption" color="success.main" fontWeight="700">Preview</Typography>
                    <Typography variant="h6" color="#1a0dab">{product.seo?.title || product.title}</Typography>
                    <Typography variant="body2" color="#006621">{storeDomain}/products/{product.slug}</Typography>
                    <Typography variant="body2" color="text.secondary">{product.seo?.metaDescription || "No description."}</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <GridItem size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">SLUG</Typography><Typography>{product.slug}</Typography></GridItem>
                    <GridItem size={{ xs: 6 }}><Typography variant="caption" color="text.secondary">KEYWORDS</Typography><Typography>{Array.isArray(product.seo?.keywords) ? product.seo.keywords.join(', ') : "N/A"}</Typography></GridItem>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>

            {/* Metadata Card remains standard */}
            <Card sx={{ borderRadius: 4, bgcolor: 'rgba(0,0,0,0.02)', border: '1px dashed #ccc' }}>
              <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box><Typography variant="caption">ADDED BY</Typography><Typography variant="body2" fontWeight="600">{creatorName || "System"}</Typography></Box>
                  <Box><Typography variant="caption">CREATED AT</Typography><Typography variant="body2" fontWeight="600">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</Typography></Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        )}

        {/* Product QR Code - Standard Index 6, Bundle Index 4 */}
        {((!product.isBundle && activeTab === 6) || (product.isBundle && activeTab === 4)) && (
          <ProductQrCodeWidget productId={product._id || product.id} storeSettings={storeSettings} />
        )}

        {/* Customer Reviews - Standard Index 7, Bundle Index 5 */}
        {((!product.isBundle && activeTab === 7) || (product.isBundle && activeTab === 5)) && (
          <ProductReviewsWidget productId={product._id || product.id} />
        )}
      </Box>
    </Container>
  );
}

function ProductQrCodeWidget({ productId, storeSettings }: { productId: string; storeSettings: any }) {
  const [qrData, setQrData] = useState<{ qrCode: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchQr = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getProductQrCode(productId);
        setQrData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load QR Code");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchQr();
  }, [productId]);

  const handleCopy = () => {
    if (qrData?.url) {
      navigator.clipboard.writeText(qrData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (qrData?.qrCode) {
      const link = document.createElement("a");
      link.href = qrData.qrCode;
      link.download = `product-qr-${productId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (!qrData) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Product QR Code Label</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #fff;
            }
            .label-card {
              border: 2px solid #000;
              padding: 24px;
              width: 320px;
              text-align: center;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .store-name {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 2px;
              font-weight: 700;
              color: #555;
              margin-bottom: 8px;
            }
            .product-title {
              font-size: 20px;
              font-weight: 800;
              margin: 8px 0;
              color: #000;
            }
            .qr-image {
              width: 200px;
              height: 200px;
              margin: 16px auto;
            }
            .scan-text {
              font-size: 11px;
              color: #666;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              body {
                background: none;
              }
              .label-card {
                border: 2px solid #000;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="store-name">${storeSettings?.storeName || "EPxWEB Store"}</div>
            <div style="border-bottom: 1px dashed #ccc; margin: 8px 0;"></div>
            <div class="product-title">Scan to Order</div>
            <img class="qr-image" src="${qrData.qrCode}" alt="Product QR Code" />
            <div style="border-top: 1px dashed #ccc; margin: 8px 0; padding-top: 8px;"></div>
            <div class="scan-text">Direct Checkout enabled</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={40} sx={{ color: "#667eea" }} />
      </Box>
    );
  }

  if (error || !qrData) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {error || "Could not retrieve QR code data"}
      </Alert>
    );
  }

  return (
    <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ py: 2 }}>
      <GridItem size={{ xs: 12, md: 5 }} display="flex" justifyContent="center">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 6,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%)",
            border: "1px solid rgba(102, 126, 234, 0.15)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.03)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            transition: "all 0.4s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 25px 50px rgba(102, 126, 234, 0.08)",
              borderColor: "rgba(102, 126, 234, 0.3)"
            }
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 5,
              bgcolor: "#FFFFFF",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
              mb: 3,
              display: "flex"
            }}
          >
            <img
              src={qrData.qrCode}
              alt="Product QR Code"
              style={{
                width: 250,
                height: 250,
                objectFit: "contain",
                borderRadius: 12
              }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" fontWeight="700" sx={{ textTransform: "uppercase", letterSpacing: 1.5, mb: 1 }}>
            Direct Order Target
          </Typography>
          <Tooltip title={qrData.url}>
            <Typography
              variant="body2"
              fontWeight="600"
              color="primary"
              sx={{
                maxWidth: 320,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
                textDecoration: "underline"
              }}
              onClick={handleCopy}
            >
              {qrData.url}
            </Typography>
          </Tooltip>
        </Paper>
      </GridItem>

      <GridItem size={{ xs: 12, md: 6 }}>
        <Card sx={{ borderRadius: 6, boxShadow: "0 10px 30px rgba(0,0,0,0.02)", p: 4, border: "1px solid #f1f5f9" }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: "text.primary" }}>
                Streamline Checkout with QRs
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                This QR Code points directly to the dynamic storefront details page of this product. When scanned by customers on their mobile phones, they can view details, select variants, and complete their checkout seamlessly.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight="700" color="text.primary" gutterBottom>
                Print & Sharing Options
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Download high-contrast QR labels to stick on packaging boxes, include in promotional flyer designs, or display inside retail store shelves.
              </Typography>

              <Grid container spacing={2}>
                <GridItem size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontWeight: 700,
                      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.2)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                        boxShadow: "0 6px 20px rgba(102, 126, 234, 0.3)"
                      }
                    }}
                  >
                    Download Image
                  </Button>
                </GridItem>
                <GridItem size={{ xs: 12, sm: 6 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      borderColor: "#764ba2",
                      color: "#764ba2",
                      fontWeight: 700,
                      "&:hover": {
                        borderColor: "#667eea",
                        bgcolor: "rgba(118, 75, 162, 0.05)"
                      }
                    }}
                  >
                    Print Label
                  </Button>
                </GridItem>
                <GridItem size={{ xs: 12 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CopyIcon />}
                    onClick={handleCopy}
                    sx={{
                      py: 1.2,
                      borderRadius: 3,
                      borderColor: "divider",
                      color: "text.primary",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "text.primary",
                        bgcolor: "background.default"
                      }
                    }}
                  >
                    {copied ? "Copied Link!" : "Copy Product URL"}
                  </Button>
                </GridItem>
              </Grid>
            </Box>
          </Stack>
        </Card>
      </GridItem>
    </Grid>
  );
}

function ProductReviewsWidget({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await productsApi.getProductReviews(productId);
      setReviews(res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleCreateReview = async () => {
    if (!customerName || !rating || !comment) {
      setFormError("All fields except email are required.");
      return;
    }
    try {
      setSubmitting(true);
      setFormError(null);
      await productsApi.createProductReview(productId, {
        customerName,
        customerEmail: customerEmail || undefined,
        rating,
        comment,
      });
      setDialogOpen(false);
      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setRating(5);
      setComment("");
      // Refresh
      fetchReviews();
    } catch (err: any) {
      setFormError(err.message || "Failed to create review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      await productsApi.updateReviewStatus(reviewId, status);
      fetchReviews();
    } catch (err: any) {
      alert(err.message || "Failed to update review status");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await productsApi.deleteReview(reviewId);
      fetchReviews();
    } catch (err: any) {
      alert(err.message || "Failed to delete review");
    }
  };

  // Stats
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const averageRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : "0.0";

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header & Stats Card */}
      <Card sx={{ borderRadius: 4, mb: 4, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ textAlign: 'center', bgcolor: 'rgba(102, 126, 234, 0.08)', p: 2, borderRadius: 3, minWidth: 100 }}>
              <Typography variant="h3" fontWeight="800" color="#667eea">{averageRating}</Typography>
              <Rating value={Number(averageRating)} precision={0.1} readOnly size="small" />
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                {approvedReviews.length} Approved Reviews
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="700">Product Ratings & Reviews</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage reviews submitted by storefront visitors or manually write verified buyer reviews.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<RateReviewIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 3,
              px: 3,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.25)',
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              }
            }}
          >
            Manually Write Review
          </Button>
        </Box>
      </Card>

      {/* Review List Section */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#667eea' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      ) : reviews.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px dashed #e2e8f0', bgcolor: 'rgba(0,0,0,0.01)' }}>
          <StarOutlineIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
          <Typography variant="h6" fontWeight="600" color="text.secondary">No Reviews Yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            There are no reviews for this product yet. Tap "Manually Write Review" to add the first one.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2.5}>
          {reviews.map((review) => {
            const isApproved = review.status === 'approved';
            const isRejected = review.status === 'rejected';
            const isPending = review.status === 'pending';

            return (
              <Card key={review.id} sx={{ borderRadius: 4, border: '1px solid #edf2f7', transition: '0.2s', '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.04)' } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="700">{review.customerName}</Typography>
                        {review.customerEmail && (
                          <Typography variant="caption" color="text.secondary">({review.customerEmail})</Typography>
                        )}
                        <Chip
                          label={review.status.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            bgcolor: isApproved ? 'rgba(72, 187, 120, 0.1)' : isRejected ? 'rgba(245, 101, 101, 0.1)' : 'rgba(236, 201, 75, 0.1)',
                            color: isApproved ? '#48bb78' : isRejected ? '#f56565' : '#ecc94b',
                            border: '1px solid',
                            borderColor: isApproved ? 'rgba(72, 187, 120, 0.2)' : isRejected ? 'rgba(245, 101, 101, 0.2)' : 'rgba(236, 201, 75, 0.2)'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {review.comment}
                      </Typography>
                    </Box>

                    {/* Moderation Controls */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {isPending && (
                        <>
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => handleUpdateStatus(review.id, 'approved')}
                            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleUpdateStatus(review.id, 'rejected')}
                            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {isApproved && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleUpdateStatus(review.id, 'rejected')}
                          sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                        >
                          Reject
                        </Button>
                      )}
                      {isRejected && (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleUpdateStatus(review.id, 'approved')}
                          sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                        >
                          Approve
                        </Button>
                      )}
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteReview(review.id)}
                        sx={{ ml: 1, bgcolor: 'rgba(245, 101, 101, 0.05)', '&:hover': { bgcolor: 'rgba(245, 101, 101, 0.1)' } }}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Manual Review Creation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Write Verified Customer Review</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>
          )}
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>Rating Stars</Typography>
              <Rating
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                size="large"
              />
            </Box>
            <TextField
              label="Customer Name"
              placeholder="e.g. John Doe"
              fullWidth
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <TextField
              label="Customer Email (Optional)"
              placeholder="e.g. customer@example.com"
              fullWidth
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <TextField
              label="Review Message"
              placeholder="Write customer review comment here..."
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting}
            onClick={handleCreateReview}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              }
            }}
          >
            {submitting ? "Saving..." : "Save Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
