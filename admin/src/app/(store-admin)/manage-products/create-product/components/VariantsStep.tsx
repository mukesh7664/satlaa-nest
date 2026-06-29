"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  IconButton,
  Autocomplete,
  Chip,
  Switch,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  AutoFixHigh as GenerateIcon,
  CurrencyExchange as CurrencyIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Category } from "@/services/categories.api";
import { settingsApi } from "@/services/settings.api";
import { toast } from "sonner";
import { getCurrencySymbol } from "@/utils/currencyUtils";

interface VariantsStepProps {
  formData: any;
  setFormData: (data: any) => void;
  category: Category;
}

const GST_RATES = [0, 5, 12, 18, 28];

export default function VariantsStep({ formData, setFormData, category }: VariantsStepProps) {
  const categoryVariants = useMemo(() => {
    return (category.fieldsConfig?.fields || []).filter((f: any) => f.is_variant);
  }, [category]);

  // Only handle category-defined variants
  const allVariantAttributes = categoryVariants;

  const [loading, setLoading] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [currencyDialog, setCurrencyDialog] = useState<{ open: boolean; variantIndex: number | null }>({
    open: false,
    variantIndex: null,
  });

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

  const handleAttributeSelection = (attrName: string, values: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      variantAttributeSelections: {
        ...(prev.variantAttributeSelections || {}),
        [attrName]: values,
      },
    }));
  };

  const generateVariants = () => {
    const selectedAttrNames = Object.keys(formData.variantAttributeSelections || {}).filter(
      (name) => formData.variantAttributeSelections[name]?.length > 0
    );

    if (selectedAttrNames.length === 0) {
      toast.error("Please select at least one value for variant attributes");
      return;
    }

    // Cartesian product logic
    const attrValues = selectedAttrNames.map((name) =>
      formData.variantAttributeSelections[name].map((val: string) => ({
        attributeName: name,
        value: val,
      }))
    );

    let combinations: any[][] = [[]];
    for (const values of attrValues) {
      const nextCombinations: any[][] = [];
      for (const combo of combinations) {
        for (const val of values) {
          nextCombinations.push([...combo, val]);
        }
      }
      combinations = nextCombinations;
    }

    const parentTitle = formData.productInfo?.title || formData.productInfo?.name || "Product";
    const parentSku = formData.sku || formData.productInfo?.sku || parentTitle.slice(0, 3).toUpperCase();

    const newVariants = combinations.map((combo: any[], index: number) => {
      const attributesLabel = combo.map((c) => c.value).join(" ");
      const variantName = `${parentTitle} ${attributesLabel}`;
      const variantSku = `${parentSku}-${combo.map((c) => c.value).join("-").replace(/\s+/g, "").toUpperCase()}`.replace(/-+/g, "-");
      
      return {
        id: `temp-${Date.now()}-${index}`,
        name: variantName,
        sku: variantSku,
        price: formData.simplePricing?.basePrice ?? "",
        comparePrice: "",
        stock: "",
        isActive: true,
        attributes: combo.reduce((acc: any, c: any) => {
          acc[c.attributeName.toLowerCase()] = c.value;
          return acc;
        }, {}),
      };
    });

    setFormData((prev: any) => {
      const existingVariants = prev.variants || [];
      const mergedVariants = [...existingVariants];

      newVariants.forEach((nv) => {
        const exists = existingVariants.some((ev: any) => ev.name === nv.name);
        if (!exists) {
          mergedVariants.push(nv);
        }
      });

      return {
        ...prev,
        variants: mergedVariants,
      };
    });
    toast.success(`${newVariants.length} variants generated!`);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updatedVariants = [...(formData.variants || [])];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, variants: updatedVariants }));
  };

  const calculateFinalPrice = (price: any, taxRate: number) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || !numPrice) return 0;
    return (numPrice * (1 + (taxRate || 0) / 100)).toFixed(2);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = (formData.variants || []).filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, variants: updatedVariants }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ mb: { xs: 1, xl: 2 } }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: "primary.main", fontSize: { xs: '0.9rem', xl: '1.25rem' } }}>
          Inventory & Variations
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '10px', xl: '12px' } }}>
          Configure variations and manage pricing/stock.
        </Typography>
      </Box>

      {/* Pricing Type Toggle */}
      <Paper sx={{ p: { xs: 1.5, xl: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
        <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, color: "text.primary", fontSize: { xs: 11, xl: 14 } }}>
          Product Type
        </Typography>
        <RadioGroup
          row
          value={formData.productPricingType || "simple"}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, productPricingType: e.target.value }))}
        >
          <FormControlLabel value="simple" control={<Radio size="small" />} label={<Typography sx={{ fontSize: { xs: 11, xl: 14 } }}>Simple Product</Typography>} />
          <FormControlLabel 
            value="variable" 
            control={<Radio size="small" />} 
            label={<Typography sx={{ fontSize: { xs: 11, xl: 14 } }}>Variable Product</Typography>} 
          />
        </RadioGroup>
      </Paper>

      {formData.productPricingType === "simple" || !formData.productPricingType ? (
        /* SIMPLE PRODUCT UI */
        <Paper sx={{ p: { xs: 1.5, xl: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2, color: "text.primary", fontSize: { xs: 11, xl: 14 } }}>
            Pricing & Inventory Details
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: { xs: 1.5, xl: 3 } }}>
            <TextField
              label="SKU"
              size="small"
              value={formData.sku || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, sku: e.target.value }))}
              InputProps={{ sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }}
              fullWidth
            />
            <TextField
              label="Base Price *"
              size="small"
              type="number"
              value={formData.simplePricing?.basePrice || ""}
              onChange={(e) => setFormData((prev: any) => ({
                ...prev,
                simplePricing: { ...prev.simplePricing, basePrice: e.target.value === "" ? null : Number(e.target.value) }
              }))}
              InputProps={{ 
                startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: { xs: 11, xl: 14 } } }}>{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}</InputAdornment>,
                sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } }
              }}
              fullWidth
            />
            <TextField
              label="Cost Price (COGS)"
              size="small"
              type="number"
              value={formData.simplePricing?.costPrice || ""}
              onChange={(e) => setFormData((prev: any) => ({
                ...prev,
                simplePricing: { ...prev.simplePricing, costPrice: e.target.value === "" ? null : Number(e.target.value) }
              }))}
              InputProps={{ 
                startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: { xs: 11, xl: 14 } } }}>{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}</InputAdornment>,
                sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } }
              }}
              fullWidth
            />
            <Autocomplete
              options={GST_RATES}
              getOptionLabel={(option) => `${option}%`}
              value={formData.productInfo?.tax_rate || 0}
              onChange={(_, newValue) => setFormData((prev: any) => ({
                ...prev,
                productInfo: { ...prev.productInfo, tax_rate: newValue }
              }))}
              renderInput={(params) => (
                <TextField {...params} label="GST Rate (%)" size="small" fullWidth InputProps={{ ...params.InputProps, sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }} />
              )}
            />
            <TextField
              label="Final Sale Price"
              size="small"
              value={calculateFinalPrice(formData.simplePricing?.basePrice, formData.productInfo?.tax_rate)}
              disabled
              InputProps={{ 
                startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: { xs: 11, xl: 14 } } }}>{getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}</InputAdornment> ,
                readOnly: true,
                sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } }
              }}
              fullWidth
            />
            <TextField
              label="Stock Quantity"
              size="small"
              type="number"
              value={formData.simplePricing?.stockQuantity || ""}
              onChange={(e) => setFormData((prev: any) => ({
                ...prev,
                simplePricing: { ...prev.simplePricing, stockQuantity: e.target.value === "" ? null : Number(e.target.value) }
              }))}
              InputProps={{ sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }}
              fullWidth
            />
          </Box>

          {/* Multi-currency Overrides for Simple Product */}
          {storeSettings?.supportedCurrencies?.length > 1 && (
            <Box sx={{ mt: 3 }}>
              <Accordion variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CurrencyIcon sx={{ color: "primary.main", fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Multi-currency Price Overrides (Optional)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    By default, prices are auto-converted based on exchange rates. Use these fields to set manual fixed prices for specific currencies.
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
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
                            startAdornment: <Typography variant="caption" sx={{ mr: 1, color: "text.secondary" }}>{code}</Typography>
                          }}
                          sx={{ bgcolor: "white" }}
                        />
                      ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </Paper>
      ) : (
        /* VARIABLE PRODUCT UI */
        <>
          {/* Attribute Value Selection */}
          <Paper sx={{ p: { xs: 1.5, xl: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2, color: "text.primary", fontSize: { xs: 11, xl: 14 } }}>
              1. Select Variant Values
            </Typography>
        <Stack spacing={{ xs: 1.5, xl: 3 }}>
          {allVariantAttributes.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2, fontSize: { xs: 11, xl: 14 } }}>
              This category does not have any predefined variant attributes.
            </Typography>
          ) : (
            allVariantAttributes.map((attr: any) => (
              <Box key={attr.name} sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: { xs: 1, xl: 2 }, border: '1px solid #eee', borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: "text.secondary", textTransform: 'uppercase', fontSize: { xs: 9, xl: 11 } }}>
                    {attr.name} (Category)
                    </Typography>
                <Autocomplete
                  multiple
                  freeSolo
                  options={attr.options || []}
                  value={formData.variantAttributeSelections?.[attr.name] || []}
                  onChange={(_, newValue) => handleAttributeSelection(attr.name, newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return <Chip key={key} label={option} {...tagProps} size="small" color="primary" variant="outlined" sx={{ fontSize: { xs: 10, xl: 12 } }} />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} placeholder={`Add options for ${attr.name.toLowerCase()}...`} size="small" fullWidth InputProps={{ ...params.InputProps, sx: { minHeight: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }} />
                  )}
                />
              </Box>
            ))
          )}
          {/* Add GST Selection for Variable Products too */}
          <Box sx={{ p: { xs: 1, xl: 2 }, border: '1px solid #e3f2fd', borderRadius: 2, bgcolor: '#f0f7ff' }}>
            <Typography variant="caption" fontWeight="bold" sx={{ color: "primary.main", textTransform: 'uppercase', fontSize: { xs: 9, xl: 11 } }}>
              Global GST Rate (%)
            </Typography>
            <Autocomplete
              options={GST_RATES}
              getOptionLabel={(option) => `${option}%`}
              value={formData.productInfo?.tax_rate || 0}
              onChange={(_, newValue) => setFormData((prev: any) => ({
                ...prev,
                productInfo: { ...prev.productInfo, tax_rate: newValue }
              }))}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select GST Rate..." size="small" fullWidth sx={{ mt: 1, bgcolor: 'white' }} InputProps={{ ...params.InputProps, sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }} />
              )}
            />
          </Box>

          {allVariantAttributes.length > 0 && (
            <Button
              variant="contained"
              startIcon={<GenerateIcon sx={{ fontSize: { xs: 16, xl: 20 } }} />}
              onClick={generateVariants}
              sx={{ alignSelf: "flex-start", py: { xs: 0.5, xl: 1.5 }, px: { xs: 1.5, xl: 3 }, borderRadius: 2, fontSize: { xs: 11, xl: 14 } }}
              disabled={!Object.values(formData.variantAttributeSelections || {}).some((v: any) => v?.length > 0)}
            >
              Generate Variant Matrix
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Variant Table */}
      {(formData.variants?.length > 0) && (
        <Paper sx={{ p: { xs: 1.5, xl: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
          <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2, color: "text.primary", fontSize: { xs: 11, xl: 14 } }}>
            2. Configure Variants ({formData.variants.length})
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: 10, xl: 13 } }}>Combo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: 10, xl: 13 } }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: 10, xl: 13 } }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: 10, xl: 13 } }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: 10, xl: 13 } }}>Cost Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: 10, xl: 13 } }}>GST</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: 10, xl: 13 } }}>Final</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: 10, xl: 13 } }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: { xs: 10, xl: 13 } }}>Active</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: { xs: 10, xl: 13 } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.variants.map((variant: any, index: number) => {
                  const comboLabel = Object.entries(variant.attributes || {})
                    .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                    .join(", ");
                    
                  return (
                    <TableRow key={variant.id || index} hover>
                      <TableCell sx={{ fontWeight: 500, maxWidth: 200 }}>
                        <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: 10, xl: 13 } }}>{comboLabel}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 9, xl: 11 } }}>{variant.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box 
                          sx={{ 
                            width: { xs: 30, xl: 40 }, 
                            height: { xs: 30, xl: 40 }, 
                            bgcolor: '#f5f5f5', 
                            borderRadius: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px dashed #ccc',
                            cursor: 'pointer'
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.5rem' }}>IMG</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={variant.sku || ""}
                          onChange={(e) => updateVariant(index, "sku", e.target.value)}
                          sx={{ width: { xs: 100, xl: 140 } }}
                          InputProps={{ sx: { height: { xs: 28, xl: 36 }, fontSize: { xs: 10, xl: 13 } } }}
                        />
                      </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={variant.price ?? ""}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          sx={{ width: { xs: 70, xl: 90 } }}
                          InputProps={{ sx: { height: { xs: 28, xl: 36 }, fontSize: { xs: 10, xl: 13 } } }}
                        />
                        {storeSettings?.supportedCurrencies?.length > 1 && (
                          <IconButton 
                            size="small" 
                            color={variant.manualCurrencyPrices && Object.keys(variant.manualCurrencyPrices).length > 0 ? "primary" : "default"}
                            onClick={() => setCurrencyDialog({ open: true, variantIndex: index })}
                          >
                            <CurrencyIcon sx={{ fontSize: { xs: 14, xl: 18 } }} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={variant.costPrice ?? ""}
                        onChange={(e) => updateVariant(index, "costPrice", e.target.value)}
                        sx={{ width: { xs: 70, xl: 90 } }}
                        InputProps={{ sx: { height: { xs: 28, xl: 36 }, fontSize: { xs: 10, xl: 13 } } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ width: 40, fontSize: { xs: 10, xl: 13 } }}>
                        {formData.productInfo?.tax_rate || 0}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700" color="primary" sx={{ width: 80, fontSize: { xs: 10, xl: 13 } }}>
                        {getCurrencySymbol(storeSettings?.defaultCurrency || "INR")}{calculateFinalPrice(variant.price, formData.productInfo?.tax_rate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={variant.stock ?? ""}
                        onChange={(e) => updateVariant(index, "stock", e.target.value)}
                        sx={{ width: { xs: 75, xl: 90 } }}
                        InputProps={{ sx: { height: { xs: 28, xl: 36 }, fontSize: { xs: 10, xl: 13 } } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        size="small"
                        checked={variant.isActive}
                        onChange={(e) => updateVariant(index, "isActive", e.target.checked)}
                      />
                    </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => removeVariant(index)}>
                          <DeleteIcon sx={{ fontSize: { xs: 14, xl: 18 } }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Variant Currency Price Dialog */}
      <Dialog 
        open={currencyDialog.open} 
        onClose={() => setCurrencyDialog({ open: false, variantIndex: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Manual Price Overrides for {currencyDialog.variantIndex !== null ? formData.variants[currencyDialog.variantIndex].name : ""}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set manual prices for specific currencies. Leave blank to use automatic conversion.
          </Typography>
          <Grid container spacing={2}>
            {storeSettings?.supportedCurrencies?.filter((c: string) => c !== (storeSettings?.defaultCurrency || "INR")).map((code: string) => (
              <Grid size={{ xs: 6 }} key={code}>
                <TextField
                  fullWidth
                  label={`Price in ${code}`}
                  type="number"
                  size="small"
                  value={currencyDialog.variantIndex !== null ? (formData.variants[currencyDialog.variantIndex].manualCurrencyPrices?.[code] || "") : ""}
                  onChange={(e) => {
                    if (currencyDialog.variantIndex === null) return;
                    const val = e.target.value === "" ? undefined : Number(e.target.value);
                    const updatedVariants = [...formData.variants];
                    const variant = { ...updatedVariants[currencyDialog.variantIndex] };
                    const manualPrices = { ...(variant.manualCurrencyPrices || {}) };
                    
                    if (val === undefined) {
                      delete manualPrices[code];
                    } else {
                      manualPrices[code] = val;
                    }
                    
                    variant.manualCurrencyPrices = manualPrices;
                    updatedVariants[currencyDialog.variantIndex] = variant;
                    setFormData((prev: any) => ({ ...prev, variants: updatedVariants }));
                  }}
                  InputProps={{
                    startAdornment: <Typography variant="caption" sx={{ mr: 1, color: "text.secondary" }}>{code}</Typography>
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCurrencyDialog({ open: false, variantIndex: null })} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
      </>
      )}
    </Box>
  );
}
