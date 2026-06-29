import React, { useState } from "react";
import StyledTextModal from "@/components/StyledTextModal";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import { Button, Box, TextField, Select, MenuItem, Stack } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

interface ProductCarouselEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const ProductCarouselEditor: React.FC<ProductCarouselEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addProduct = () => {
    const currentProducts = data.products || [];
    const newProducts = [
      { name: "", description: "", image: "" },
      ...currentProducts,
    ];
    updateField("products", newProducts);
  };

  const removeProduct = (index: number) => {
    const currentProducts = data.products || [];
    const newProducts = currentProducts.filter(
      (_: any, i: number) => i !== index
    );
    updateField("products", newProducts);
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const currentProducts = [...(data.products || [])];
    currentProducts[index] = { ...currentProducts[index], [field]: value };
    updateField("products", currentProducts);
  };

  return (
    <div className="space-y-6">
      <Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FormatPaintIcon />}
          onClick={() => setStyleModalOpen(true)}
          sx={{ mb: 2 }}
        >
          Style Text Tool
        </Button>
        <StyledTextModal
          open={styleModalOpen}
          onClose={() => setStyleModalOpen(false)}
        />
      </Box>

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5 col-span-2">
          <label className="text-sm font-medium text-slate-700">
            Section Title
          </label>
          <TextField
            size="small"
            fullWidth
            value={data.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g., Our Latest Hardware Products"
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Products</h3>
          <button
            onClick={addProduct}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
          >
            <AddIcon fontSize="small" />
            Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {(data.products || []).map((product: any, index: number) => (
            <div
              key={index}
              className="relative border border-slate-200 rounded-lg p-3 bg-white space-y-3 group"
            >
              <div className="flex justify-between">
                <span className="text-xs font-medium text-slate-500">
                  #{index + 1}
                </span>
                <button
                  onClick={() => removeProduct(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>

              {/* Image Uploader with Overflow Fix */}
              <div className="h-40 w-full relative overflow-hidden rounded-md mb-2">
                <ShopifyImagePicker
                  label="Product Image"
                  value={product.image || ""}
                  onChange={(url) => updateProduct(index, "image", url)}
                />
              </div>

              <Stack spacing={1}>
                <TextField
                  size="small"
                  fullWidth
                  value={product.name || ""}
                  onChange={(e) => updateProduct(index, "name", e.target.value)}
                  placeholder="Product Name"
                  sx={{ bgcolor: "white" }}
                />
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={product.description || ""}
                  onChange={(e) =>
                    updateProduct(index, "description", e.target.value)
                  }
                  placeholder="Short Description..."
                  sx={{ bgcolor: "white" }}
                />
              </Stack>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
