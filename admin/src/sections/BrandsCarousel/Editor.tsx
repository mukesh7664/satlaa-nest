import React, { useState } from "react";
import StyledTextModal from "@/components/StyledTextModal";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import { Button, Box, TextField, Select, MenuItem } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

interface BrandsCarouselEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const BrandsCarouselEditor: React.FC<BrandsCarouselEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addBrand = () => {
    const currentBrands = data.brands || [];
    const newBrands = [{ name: "", logoUrl: "" }, ...currentBrands];
    updateField("brands", newBrands);
  };

  const removeBrand = (index: number) => {
    const currentBrands = data.brands || [];
    const newBrands = currentBrands.filter((_: any, i: number) => i !== index);
    updateField("brands", newBrands);
  };

  const updateBrand = (index: number, field: string, value: any) => {
    const currentBrands = [...(data.brands || [])];
    currentBrands[index] = { ...currentBrands[index], [field]: value };
    updateField("brands", currentBrands);
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
          <label className="text-sm font-medium text-slate-700">Title</label>
          <TextField
            size="small"
            fullWidth
            value={data.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g., Brands For the all reliable Hardware products"
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <label className="text-sm font-medium text-slate-700">
            Description
          </label>
          <TextField
            size="small"
            fullWidth
            multiline
            rows={5}
            value={data.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="e.g., Lorem Ipsum is simply dummy text..."
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Brands</h3>
          <button
            onClick={addBrand}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
          >
            <AddIcon fontSize="small" />
            Add Brand
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(data.brands || []).map((brand: any, index: number) => (
            <div
              key={index}
              className="relative border border-slate-200 rounded-lg p-3 bg-white space-y-3 group"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-500">
                  #{index + 1}
                </span>
                <button
                  onClick={() => removeBrand(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>

              <div className="w-full relative overflow-hidden rounded-md mb-2">
                <ShopifyImagePicker
                  label="Logo"
                  value={brand.logoUrl || ""}
                  onChange={(url) => updateBrand(index, "logoUrl", url)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
