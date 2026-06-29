"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Divider,
  Autocomplete,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  CurrencyExchange as CurrencyIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { toast } from "sonner";
import { productsApi, Product } from "@/services/products.api";
import { debounce } from "lodash";
import { settingsApi } from "@/services/settings.api";
import { getCurrencySymbol } from "@/utils/currencyUtils";

// Reuse standard components
import ImagesStepNew from "../create-product/components/ImagesStepNew";
import ProductDetailsStep from "../create-product/components/ProductDetailsStep";
import SEOStep from "../create-product/components/SEOStep";
import { useAppSelector } from "@/store/hooks";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Check,
  Save,
  Package,
  Image,
  FileText,
  Search,
} from "lucide-react";

interface BundleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  mainImage?: string;
}

const STEPS = [
  { label: "Bundle Info", icon: Package },
  { label: "Media", icon: Image },
  { label: "Product Details", icon: FileText },
  { label: "SEO & Final Settings", icon: Search },
];

function BundleInfoStep({ formData, setFormData }: { formData: any; setFormData: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
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

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    if (formData.productInfo?.title && !isSlugManuallyEdited) {
      setFormData((prev: any) => ({
        ...prev,
        slug: slugify(formData.productInfo.title),
      }));
    }
  }, [formData.productInfo?.title, isSlugManuallyEdited]);

  const debouncedSearch = React.useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query || query.length < 2) {
          setSearchResults([]);
          return;
        }
        setSearching(true);
        try {
          const response = await productsApi.getAllProducts({
            search: query,
            limit: 10,
            productStructureType: "bundle_item",
          });
          setSearchResults(response.products || []);
        } catch (error) {
          console.error("Failed to search products:", error);
        } finally {
          setSearching(false);
        }
      }, 500),
    []
  );

  const handleSearchChange = (event: any, value: string, reason: string) => {
    if (reason === "input") {
      setSearchQuery(value);
      debouncedSearch(value);
    } else if (reason === "clear" || reason === "reset") {
      setSearchQuery("");
    }
  };

  const addItemToBundle = (product: Product) => {
    const productId = product.id || product._id;
    if (!productId) {
      toast.error("Invalid product: missing ID");
      return;
    }

    setFormData((prev: any) => {
      const bundleItems = prev.bundleItems || [];
      if (bundleItems.find((item: any) => item.productId === productId)) {
        toast.error("Product already added to bundle");
        return prev;
      }

      const images = (product as any).images || [];
      const mainImage = product.media?.mainImage || images.find((m: any) => m.is_main)?.url || images[0]?.url || "";

      const newItem: BundleItem = {
        productId: productId,
        name: product.productInfo?.title || product.productInfo?.name || "Untitled",
        price: product.price || (product as any).simplePricing?.minPrice || (product as any).simplePricing?.basePrice || 0,
        quantity: 1,
        mainImage: mainImage,
      };

      return {
        ...prev,
        bundleItems: [...bundleItems, newItem],
      };
    });

    setSearchQuery("");
    setSearchResults([]);
  };

  const removeItem = (productId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      bundleItems: prev.bundleItems.filter((item: any) => item.productId !== productId),
    }));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setFormData((prev: any) => ({
      ...prev,
      bundleItems: prev.bundleItems.map((item: any) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }));
  };

  const calculateTotalValue = () => {
    return (formData.bundleItems || []).reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
  };

  return (
    <Grid container spacing={{ xs: 1.5, xl: 3 }}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box sx={{ mb: { xs: 1, xl: 2 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "primary.main", fontSize: { xs: '0.9rem', xl: '1.25rem' } }}>
            Basic Information
          </Typography>
        </Box>
        <Stack spacing={{ xs: 1.5, xl: 2.5 }}>
          <TextField
            fullWidth
            label="Bundle Name *"
            required
            size="small"
            value={formData.productInfo.title}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                productInfo: { ...prev.productInfo, title: e.target.value },
              }))
            }
            InputProps={{ sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }}
          />
          <Grid container spacing={{ xs: 1.5, xl: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Slug"
                size="small"
                value={formData.slug}
                onChange={(e) => {
                  setFormData((prev: any) => ({ ...prev, slug: e.target.value }));
                  setIsSlugManuallyEdited(true);
                }}
                InputProps={{ sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Bundle SKU *"
                required
                size="small"
                value={formData.productInfo.sku}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    productInfo: { ...prev.productInfo, sku: e.target.value },
                    sku: e.target.value,
                  }))
                }
                InputProps={{ sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Short Description"
            size="small"
            value={formData.productInfo.description}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                productInfo: { ...prev.productInfo, description: e.target.value },
              }))
            }
            InputProps={{ sx: { fontSize: { xs: 11, xl: 14 } } }}
          />

          <Box sx={{ p: { xs: 1.5, xl: 2 }, bgcolor: "#f8faff", borderRadius: 3, border: "1px solid #e0e7ff", mt: 1 }}>
            <Typography variant="caption" fontWeight="bold" sx={{ color: "primary.main", textTransform: "uppercase", mb: 1, display: "block", fontSize: { xs: 9, xl: 11 } }}>
              Return & Replacement Policy
            </Typography>
            
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', p: { xs: 1, xl: 1.5 }, bgcolor: 'white', borderRadius: 2, border: '1px solid #efefff' }}>
                <input 
                  type="checkbox" 
                  id="bundle-returnable"
                  checked={formData.is_returnable} 
                  onChange={(e) => setFormData({ ...formData, is_returnable: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#4f46e5' }}
                />
                <label htmlFor="bundle-returnable" style={{ marginLeft: 8, cursor: 'pointer' }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: 10, xl: 12 } }}>Returns</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: { xs: 9, xl: 10 } }}>Allow returns</Typography>
                </label>
              </Box>

              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', p: { xs: 1, xl: 1.5 }, bgcolor: 'white', borderRadius: 2, border: '1px solid #efefff' }}>
                <input 
                  type="checkbox" 
                  id="bundle-replaceable"
                  checked={formData.is_replaceable} 
                  onChange={(e) => setFormData({ ...formData, is_replaceable: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#4f46e5' }}
                />
                <label htmlFor="bundle-replaceable" style={{ marginLeft: 8, cursor: 'pointer' }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: 10, xl: 12 } }}>Replacements</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: { xs: 9, xl: 10 } }}>Allow replacements</Typography>
                </label>
              </Box>

              <Box sx={{ width: { xs: '100%', sm: 140 } }}>
                <TextField
                  label="Return Window"
                  type="number"
                  size="small"
                  value={formData.return_window_days}
                  onChange={(e) => setFormData({ ...formData, return_window_days: parseInt(e.target.value) || 0 })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: 9, xl: 11 } }}>Days</Typography></InputAdornment>,
                    sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } }
                  }}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: { xs: 2, xl: 3 } }} />

        <Box sx={{ mb: { xs: 1, xl: 2 } }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "primary.main", fontSize: { xs: '0.9rem', xl: '1.25rem' } }}>
            Bundle Items
          </Typography>
        </Box>
        <Autocomplete
          fullWidth
          size="small"
          options={searchResults}
          value={null}
          inputValue={searchQuery}
          getOptionLabel={(option: Product) => option.productInfo?.title || ""}
          onInputChange={handleSearchChange}
          onChange={(e, value) => {
            if (value && typeof value !== "string") {
              addItemToBundle(value);
            }
          }}
          loading={searching}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Products"
              placeholder="Start typing..."
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" sx={{ fontSize: 16 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {searching ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
                sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } }
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: "flex", gap: 2, p: 1 }}>
              <Avatar
                src={option.media?.mainImage || (option as any).images?.[0]?.url || ""}
                variant="rounded"
                sx={{ width: 40, height: 40 }}
              />
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {option.productInfo?.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(option as any).displayPrice || `${getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}${option.price || (option as any).simplePricing?.basePrice || 0}`}
                </Typography>
              </Box>
            </Box>
          )}
        />

        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: { xs: 11, xl: 13 } }}>Product</TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: 11, xl: 13 } }}>Quantity</TableCell>
                <TableCell align="right" sx={{ fontSize: { xs: 11, xl: 13 } }}>Price</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(formData.bundleItems || []).map((item: any) => (
                <TableRow key={item.productId}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar src={item.mainImage} variant="rounded" sx={{ width: 32, height: 32 }} />
                      <Typography variant="body2" sx={{ fontSize: { xs: 11, xl: 13 } }}>{item.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                      sx={{ width: 60 }}
                      slotProps={{ htmlInput: { min: 1, style: { padding: '4px 8px', fontSize: 12 } } }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: 11, xl: 13 } }}>{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{item.price}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => removeItem(item.productId)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {(!formData.bundleItems || formData.bundleItems.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary", fontSize: { xs: 11, xl: 13 } }}>
                    No items added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ p: { xs: 1.5, xl: 2.5 }, bgcolor: "#f8fafc", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" fontWeight="bold" mb={1.5} sx={{ fontSize: { xs: '0.9rem', xl: '1.25rem' } }}>
            Bundle Pricing
          </Typography>
          <Stack spacing={1.5} mb={2.5}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary" sx={{ fontSize: { xs: 11, xl: 13 } }}>Total Value:</Typography>
              <Typography fontWeight="bold" sx={{ fontSize: { xs: 11, xl: 13 } }}>{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{calculateTotalValue()}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary" sx={{ fontSize: { xs: 11, xl: 13 } }}>Items Count:</Typography>
              <Typography fontWeight="bold" sx={{ fontSize: { xs: 11, xl: 13 } }}>{formData.bundleItems?.length || 0}</Typography>
            </Box>
          </Stack>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Bundle Base Price *"
              type="number"
              required
              size="small"
              value={formData.simplePricing.basePrice || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  simplePricing: { ...prev.simplePricing, basePrice: parseFloat(e.target.value) },
                  price: parseFloat(e.target.value),
                }))
              }
              InputProps={{
                startAdornment: <InputAdornment position="start"><Typography variant="caption" sx={{ fontSize: { xs: 10, xl: 13 } }}>{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}</Typography></InputAdornment>,
                sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } }
              }}
            />

            <TextField
              fullWidth
              label="Bundle Cost Price"
              type="number"
              size="small"
              value={formData.simplePricing.costPrice || ""}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  simplePricing: { ...prev.simplePricing, costPrice: parseFloat(e.target.value) },
                  costPrice: parseFloat(e.target.value),
                }))
              }
              InputProps={{
                startAdornment: <InputAdornment position="start"><Typography variant="caption" sx={{ fontSize: { xs: 10, xl: 13 } }}>{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}</Typography></InputAdornment>,
                sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } }
              }}
            />

            <Autocomplete
              options={[0, 5, 12, 18, 28]}
              getOptionLabel={(option) => `${option}%`}
              value={formData.productInfo.tax_rate || 0}
              onChange={(_, newValue) =>
                setFormData((prev: any) => ({
                  ...prev,
                  productInfo: { ...prev.productInfo, tax_rate: newValue || 0 },
                }))
              }
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Tax Rate (GST %)" 
                  size="small" 
                  fullWidth 
                  InputProps={{
                    ...params.InputProps,
                    sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } }
                  }}
                />
              )}
            />

            <Box sx={{ p: { xs: 1, xl: 1.5 }, bgcolor: 'rgba(123, 63, 242, 0.05)', borderRadius: 2, border: '1px dashed #7B3FF2' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ fontSize: { xs: 8, xl: 10 } }}>FINAL SELLING PRICE (BASE + GST)</Typography>
              <Typography variant="h5" fontWeight="bold" color="#7B3FF2" sx={{ fontSize: { xs: '1.1rem', xl: '1.5rem' } }}>
                {getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{(parseFloat(String(formData.simplePricing.basePrice || 0)) * (1 + (formData.productInfo.tax_rate || 0) / 100)).toFixed(2)}
              </Typography>
            </Box>

            {/* Multi-currency Overrides for Bundle */}
            {storeSettings?.supportedCurrencies?.length > 1 && (
              <Box sx={{ mt: 1 }}>
                <Accordion variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "white" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CurrencyIcon sx={{ color: "#7B3FF2", fontSize: 18 }} />
                      <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: 10, xl: 12 } }}>
                        Currency Overrides
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: { xs: 1, xl: 1.5 } }}>
                    <Stack spacing={1.5}>
                      {storeSettings.supportedCurrencies
                        .filter((c: string) => c !== (storeSettings?.defaultCurrency || "INR"))
                        .map((code: string) => (
                          <TextField
                            key={code}
                            label={`Price in ${code}`}
                            size="small"
                            type="number"
                            value={formData.manualCurrencyPrices?.[code] ?? ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? undefined : Number(e.target.value);
                              const newManualPrices = { ...(formData.manualCurrencyPrices || {}) };
                              if (val === undefined) {
                                delete newManualPrices[code];
                              } else {
                                newManualPrices[code] = val;
                              }
                              setFormData((prev: any) => ({ ...prev, manualCurrencyPrices: newManualPrices }));
                            }}
                            InputProps={{
                              startAdornment: <Typography variant="caption" sx={{ mr: 1, color: "text.secondary", fontSize: { xs: 10, xl: 12 } }}>{code}</Typography>,
                              sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } }
                            }}
                            sx={{ bgcolor: "white" }}
                            fullWidth
                          />
                        ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}

// Add a helper for MUI v6 Grid compatibility


export default function AddBundlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { themeColors, componentColors } = useAppSelector((state: any) => state.settings);
  const btnColor = (() => {
    const key = componentColors?.buttonContained || "primary";
    return (themeColors as any)[key] || themeColors.primary || "#7B3FF2";
  })();

  const [formData, setFormData] = useState<any>({
    isBundle: true,
    productStructureType: "bundle",
    productInfo: {
      title: "",
      sku: "",
      description: "",
      brand: "",
      tax_rate: 0,
    },
    simplePricing: {
      basePrice: null,
      costPrice: null,
      currency: "INR",
    },
    bundleItems: [],
    media: [],
    images: [], // for compatibility with ImagesStepNew
    productDetails: {
      overview: { enabled: true, title: "Overview", content: "" },
      features: { enabled: true, title: "Features", featurePoints: [], checklist: [] },
      specifications: { enabled: true, title: "Specifications", items: [] },
      faq: { enabled: true, questions: [] },
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
    },
    slug: "",
    isActive: true,
    is_returnable: false,
    is_replaceable: false,
    return_window_days: 7,
  });

  useEffect(() => {
    if (productId) {
      const fetchBundleDetails = async () => {
        setLoading(true);
        try {
          const product = await productsApi.getProductById(productId);
          
          setFormData({
            isBundle: true,
            productStructureType: "bundle",
            productInfo: {
              title: product.productInfo?.title || product.productInfo?.name || "",
              sku: product.productInfo?.sku || product.sku || "",
              description: product.productInfo?.description || "",
              brand: product.productInfo?.brand || "",
              tax_rate: product.productInfo?.tax_rate || 0,
            },
            simplePricing: {
              basePrice: product.price || (product as any).simplePricing?.basePrice || 0,
              costPrice: product.costPrice || (product as any).simplePricing?.costPrice || 0,
              currency: (product as any).simplePricing?.currency || "INR",
            },
            bundleItems: product.bundleItems || [],
            media: product.media || [],
            images: product.images || product.media || [], // Ensure some mapping to 'images' for ImagesStepNew
            productDetails: {
              overview: product.productDetails?.overview || { enabled: true, title: "Overview", content: "" },
              features: product.productDetails?.features || { enabled: true, title: "Features", featurePoints: [], checklist: [] },
              specifications: product.productDetails?.specifications || { enabled: true, title: "Specifications", items: [] },
              faq: product.productDetails?.faq || { enabled: true, questions: [] },
            },
            seo: {
              metaTitle: product.seo?.metaTitle || "",
              metaDescription: product.seo?.metaDescription || "",
              keywords: product.seo?.keywords || [],
            },
            slug: product.slug || "",
            isActive: product.isActive !== false,
            is_returnable: product.is_returnable ?? false,
            is_replaceable: product.is_replaceable ?? false,
            return_window_days: product.return_window_days ?? 7,
            manualCurrencyPrices: product.manualCurrencyPrices || {},
          });
        } catch (error) {
          console.error("Failed to fetch bundle details:", error);
          toast.error("Failed to load bundle details");
        } finally {
          setLoading(false);
        }
      };
      fetchBundleDetails();
    }
  }, [productId]);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);

  const validateStep = (step: number): boolean => {
    if (step === 0) {
      if (!formData.productInfo.title) {
        toast.error("Bundle Name is required");
        return false;
      }
      if (!formData.productInfo.sku) {
        toast.error("Bundle SKU is required");
        return false;
      }
      if (formData.simplePricing.basePrice === null || formData.simplePricing.basePrice === undefined || formData.simplePricing.basePrice === "") {
        toast.error("Bundle Base Price is required");
        return false;
      }
      if (!formData.bundleItems || formData.bundleItems.length === 0) {
        toast.error("Please add at least one product to the bundle");
        return false;
      }
    }
    return true;
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === activeStep) return;
    setActiveStep(targetStep);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      router.push("/manage-products/product-list");
    } else {
      setActiveStep((prev) => prev - 1);
    }
  };

  const validateAll = (): boolean => {
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) {
        setActiveStep(i);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setSaving(true);
    try {
        // Prepare final payload
        const payload = {
            ...formData,
            price: formData.simplePricing.basePrice,
            costPrice: formData.simplePricing.costPrice,
            sku: formData.productInfo.sku,
        };
        
        if (productId) {
          await productsApi.updateProduct(productId, payload);
          toast.success("Bundle updated successfully");
        } else {
          await productsApi.createProduct(payload);
          toast.success("Bundle created successfully");
        }
        router.push("/manage-products/product-list");
    } catch (error: any) {
      console.error("Failed to save bundle:", error);
      toast.error(error.message || "Failed to save bundle");
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BundleInfoStep formData={formData} setFormData={setFormData} />;
      case 1:
        return <ImagesStepNew formData={formData} setFormData={setFormData} imageFiles={imageFiles} setImageFiles={setImageFiles} />;
      case 2:
        return <ProductDetailsStep formData={formData} setFormData={setFormData} bannerImageFile={bannerImageFile} setBannerImageFile={setBannerImageFile} />;
      case 3:
        return <SEOStep formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col product-form-container">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/manage-products/product-list")}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800">{productId ? "Edit Product Bundle" : "Create Product Bundle"}</h1>
              <p className="text-xs text-slate-500">Combo Package</p>
            </div>
          </div>

          {/* Compact Stepper */}
          <div className="hidden md:flex items-center gap-1">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < activeStep;
              const isCurrent = index === activeStep;
              return (
                <React.Fragment key={step.label}>
                  <div
                    onClick={() => handleStepClick(index)}
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-all"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isCompleted ? "text-white" : isCurrent ? "text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      style={isCompleted || isCurrent ? { background: btnColor } : {}}
                    >
                      {isCompleted ? <Check size={13} /> : <Icon size={12} />}
                    </div>
                    <span className={`text-xs font-medium hidden lg:block ${isCurrent ? "text-slate-800" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-6 h-px mx-0.5 ${index < activeStep ? "bg-current" : "bg-slate-200"}`}
                      style={index < activeStep ? { background: btnColor } : {}} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile step indicator */}
          <div className="md:hidden text-xs text-slate-500 font-medium">
            Step {activeStep + 1} / {STEPS.length}
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%`, background: btnColor }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 p-5 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Step Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
              {(() => {
                const Icon = STEPS[activeStep].icon;
                return (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: btnColor }}>
                    <Icon size={14} />
                  </div>
                );
              })()}
              <div>
                <h2 className="text-sm font-semibold text-slate-800">{STEPS[activeStep].label}</h2>
                <p className="text-xs text-slate-500">Step {activeStep + 1} of {STEPS.length}</p>
              </div>
            </div>
            {/* Content */}
            <div className="p-5">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <CircularProgress size={40} />
                </div>
              ) : (
                renderStepContent(activeStep)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
              {activeStep === 0 ? "Cancel" : "Back"}
            </button>

            {activeStep === STEPS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                style={{ background: btnColor }}
              >
                {saving ? (
                  <>
                    <CircularProgress size={14} sx={{ color: "white" }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    {productId ? "Update Bundle" : "Save Bundle"}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-all"
                style={{ background: btnColor }}
              >
                Next
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
