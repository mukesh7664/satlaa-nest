import React, { useState } from "react";
import {
  Button,
  IconButton,
  Stack,
  Paper,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import LinkPicker from "@/components/admin/LinkPicker";
import ResourceSelector from "@/components/ResourceSelector";

interface ProductItem {
  image?: string;
  title?: string;
  price?: string;
  link?: string;
  productId?: string;
}

interface ProductHighlightEditorProps {
  data: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    items?: ProductItem[];
    // Background
    bgType?: "color" | "gradient" | "image";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
  onChange: (data: any) => void;
}

export const ProductHighlightEditor: React.FC<ProductHighlightEditorProps> = ({
  data,
  onChange,
}) => {
  const [resourceSelectorOpen, setResourceSelectorOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...(data.items || [])];
    if (!newItems[index]) newItems[index] = {};
    newItems[index] = { ...newItems[index], [field]: value };
    updateField("items", newItems);
  };

  const addItem = () => {
    const newItems = [
      ...(data.items || []),
      { title: "", image: "", link: "" },
    ];
    updateField("items", newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...(data.items || [])];
    newItems.splice(index, 1);
    updateField("items", newItems);
  };

  const handleSelectProduct = (index: number) => {
    setActiveItemIndex(index);
    setResourceSelectorOpen(true);
  };

  const handleResourceSelect = (slug: string, type: string, extraData: any) => {
    if (activeItemIndex !== null && type === "product") {
      // Auto-fill data
      const newItems = [...(data.items || [])];

      const title = extraData.productInfo?.title || "";
      const price = extraData.productInfo?.price
        ? `${extraData.productInfo.price} INR`
        : "";
      // Try to find an image
      let image = "";
      if (
        extraData.productInfo?.images &&
        extraData.productInfo.images.length > 0
      ) {
        image = extraData.productInfo.images[0];
      }

      newItems[activeItemIndex] = {
        ...newItems[activeItemIndex],
        title: title,
        price: price,
        link: `/products/${slug}`, // Auto-link
        image: image || newItems[activeItemIndex].image, // Keep old if none found
        productId: extraData.id,
      };

      updateField("items", newItems);
    }
    setActiveItemIndex(null);
  };

  return (
    <div className="space-y-6">
      <ResourceSelector
        open={resourceSelectorOpen}
        onClose={() => setResourceSelectorOpen(false)}
        onSelect={handleResourceSelect}
        initialType="product"
      />

      {/* Background Settings */}
      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800">
          Background Settings
        </h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Type</label>
          <Select
            size="small"
            fullWidth
            value={data.bgType || "color"}
            onChange={(e) => updateField("bgType", e.target.value)}
            className="bg-white"
            inputProps={{ className: "bg-white" }}
          >
            <MenuItem value="color">Solid Color</MenuItem>
            <MenuItem value="gradient">Gradient</MenuItem>
            <MenuItem value="image">Image</MenuItem>
          </Select>
        </div>

        {data.bgType === "color" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={data.bgColor || "#ffffff"}
                onChange={(e) => updateField("bgColor", e.target.value)}
                className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
              />
              <TextField
                size="small"
                fullWidth
                value={data.bgColor || "#ffffff"}
                onChange={(e) => updateField("bgColor", e.target.value)}
                sx={{ bgcolor: "white" }}
              />
            </div>
          </div>
        )}

        {data.bgType === "gradient" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              CSS Gradient
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.bgGradient || ""}
              onChange={(e) => updateField("bgGradient", e.target.value)}
              placeholder="linear-gradient(to right, #ff0000, #0000ff)"
              sx={{ bgcolor: "white" }}
            />
          </div>
        )}

        {data.bgType === "image" && (
          <ShopifyImagePicker
            label="Background Image"
            value={data.backgroundImage || ""}
            onChange={(url) => updateField("backgroundImage", url)}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <Typography variant="subtitle2">Section Content</Typography>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Headline</label>
          <TextField
            size="small"
            fullWidth
            value={data.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Description
          </label>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={data.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Button Text
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.buttonText || ""}
              onChange={(e) => updateField("buttonText", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Button Link
            </label>
            <LinkPicker
              value={data.buttonLink || ""}
              onChange={(val) => updateField("buttonLink", val)}
            />
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Typography variant="subtitle2">
            Highlighted Products (Max 2)
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addItem}
            size="small"
            variant="outlined"
          >
            Add Product
          </Button>
        </div>

        <Stack spacing={2}>
          {(data.items || []).map((item, index) => (
            <Paper
              key={index}
              sx={{ p: 2, bgcolor: "grey.50" }}
              variant="outlined"
            >
              <Stack spacing={2}>
                <div className="flex justify-between items-start">
                  <Typography
                    variant="caption"
                    className="font-bold text-slate-500"
                  >
                    Product #{index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeItem(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>

                <Button
                  variant="contained"
                  size="small"
                  color="secondary"
                  startIcon={<SearchIcon />}
                  onClick={() => handleSelectProduct(index)}
                  sx={{ alignSelf: "start" }}
                >
                  Select Product to Auto-fill
                </Button>

                <div className="space-y-1.5">
                  <ShopifyImagePicker
                    label="Product Image"
                    value={item.image || ""}
                    onChange={(url) => updateItem(index, "image", url)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.title || ""}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    sx={{ bgcolor: "white" }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Price Display
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.price || ""}
                    onChange={(e) => updateItem(index, "price", e.target.value)}
                    placeholder="e.g. 4,960 INR"
                    sx={{ bgcolor: "white" }}
                  />
                </div>

                <LinkPicker
                  label="Card Link"
                  value={item.link || ""}
                  onChange={(val) => updateItem(index, "link", val)}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </div>
    </div>
  );
};
