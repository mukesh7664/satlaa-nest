import React from "react";
import { TextField, Stack, Typography, Button, IconButton, Box, Chip, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import DynamicFilterPicker, { SelectedFilter } from "@/components/DynamicFilterPicker";
import { productsApi } from "@/services/products.api";

const TabProductsPreview: React.FC<{ filter: any; limit: number }> = ({ filter, limit }) => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchPreviewProducts = async () => {
      try {
        setLoading(true);
        const params: any = { limit };
        if (filter) {
          const { type, value } = filter;
          if (type === "category") params.category = value;
          else if (type === "collection") params.collection = value;
          else if (type === "tag") params.tags = value;
          else if (type === "flag") params.flags = value;
        }
        const res = await productsApi.getAllProducts(params);
        if (res?.success && Array.isArray(res.data)) {
          setProducts(res.data);
        } else if (Array.isArray(res)) {
          setProducts(res);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to load preview products", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewProducts();
  }, [filter, limit]);

  if (loading) {
    return <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>Loading matching products preview...</Typography>;
  }

  if (products.length === 0) {
    return <Typography variant="caption" sx={{ color: "error.main", mt: 1, display: "block" }}>No matching products found for this filter.</Typography>;
  }

  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      <Typography variant="caption" fontWeight="bold" sx={{ color: "text.secondary" }}>
        Matching Products Preview ({products.length}):
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {products.map((prod, idx) => {
          const title = prod.productInfo?.title || prod.title || "Unnamed Product";
          const price = prod.productInfo?.price?.current || prod.price || 0;
          return (
            <Chip
              key={idx}
              label={`${title} ($${Number(price).toFixed(2)})`}
              size="small"
              variant="outlined"
              sx={{ bgcolor: "#fff", fontSize: "10px" }}
            />
          );
        })}
      </Box>
    </Stack>
  );
};

interface ProductTabsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const ProductTabsEditor: React.FC<ProductTabsEditorProps> = ({ data, onChange }) => {
  const productsSource = data.productsSource || "static";
  const rawTabs = data.tabs || ["New Arrivals", "Best Sellers", "On Sale"];
  const tabSettings = data.tabSettings || {};
  const products = data.products || [];

  // Normalize dynamic tabs (if they are string arrays, convert to objects)
  const normalizedTabs = React.useMemo(() => {
    if (rawTabs.length > 0 && typeof rawTabs[0] === "string") {
      return (rawTabs as string[]).map((tabName) => ({
        name: tabName,
        filter: tabSettings[tabName]?.filter || null,
        limit: tabSettings[tabName]?.limit || 5
      }));
    }
    return (rawTabs as Array<{ name: string; filter: any; limit?: number }>) || [];
  }, [rawTabs, tabSettings]);

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // --- Static Mode Operations ---
  const addStaticTab = () => {
    updateField("tabs", [...rawTabs, "New Tab"]);
  };

  const removeStaticTab = (index: number) => {
    updateField("tabs", rawTabs.filter((_: any, i: number) => i !== index));
  };

  const updateStaticTabName = (index: number, value: string) => {
    const newTabs = [...rawTabs];
    newTabs[index] = value;
    updateField("tabs", newTabs);
  };

  const addStaticProduct = () => {
    updateField("products", [...products, { name: "", price: "$0.00", image: "", rating: 5, tab: typeof rawTabs[0] === "string" ? rawTabs[0] : (rawTabs[0]?.name || "") }]);
  };

  const removeStaticProduct = (index: number) => {
    updateField("products", products.filter((_: any, i: number) => i !== index));
  };

  const updateStaticProduct = (index: number, field: string, value: any) => {
    const newProducts = products.map((prod: any, i: number) => 
      i === index ? { ...prod, [field]: value } : prod
    );
    updateField("products", newProducts);
  };

  // --- Dynamic Mode Operations ---
  const updateDynamicTabName = (idx: number, name: string) => {
    const newTabs = [...normalizedTabs];
    newTabs[idx] = { ...newTabs[idx], name };
    updateField("tabs", newTabs);
  };

  const updateDynamicTabField = (idx: number, field: string, value: any) => {
    const newTabs = [...normalizedTabs];
    newTabs[idx] = { ...newTabs[idx], [field]: value };
    updateField("tabs", newTabs);
  };

  const addDynamicTab = () => {
    const newTabs = [
      ...normalizedTabs,
      {
        name: "New Tab Category",
        filter: null,
        limit: 5
      }
    ];
    updateField("tabs", newTabs);
  };

  const removeDynamicTab = (idx: number) => {
    const newTabs = normalizedTabs.filter((_, i) => i !== idx);
    updateField("tabs", newTabs);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        AutoServices Product Tabs Settings
      </Typography>
      
      <TextField
        label="Title"
        fullWidth
        size="small"
        value={data.title || "Best Seller"}
        onChange={(e) => updateField("title", e.target.value)}
      />

      <TextField
        label="Subtitle"
        fullWidth
        size="small"
        value={data.subtitle || "Our most ordered products."}
        onChange={(e) => updateField("subtitle", e.target.value)}
      />

      <Stack spacing={3}>
        <Typography variant="subtitle1" fontWeight="bold">
          Dynamic Tabs Rules Configurator
        </Typography>

        {normalizedTabs.map((tab, tabIdx) => (
          <Stack key={tabIdx} spacing={2.5} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5, bgcolor: "#f8fafc" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <TextField
                label="Tab Name"
                size="small"
                value={tab.name || ""}
                onChange={(e) => updateDynamicTabName(tabIdx, e.target.value)}
                sx={{ flexGrow: 1, mr: 2 }}
              />
              {normalizedTabs.length > 1 && (
                <IconButton size="small" color="error" onClick={() => removeDynamicTab(tabIdx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            <DynamicFilterPicker
              label="Select Dynamic Filter"
              value={tab.filter || null}
              onChange={(filterVal) => updateDynamicTabField(tabIdx, "filter", filterVal)}
            />

            <TextField
              label="Limit (Products count)"
              type="number"
              size="small"
              fullWidth
              value={tab.limit || 5}
              onChange={(e) => updateDynamicTabField(tabIdx, "limit", parseInt(e.target.value) || 5)}
            />

            <TabProductsPreview filter={tab.filter} limit={tab.limit || 5} />
          </Stack>
        ))}

        <Button variant="outlined" startIcon={<AddIcon />} onClick={addDynamicTab} sx={{ mt: 1, borderRadius: 2 }}>
          Add Tab Category
        </Button>
      </Stack>
    </Stack>
  );
};
