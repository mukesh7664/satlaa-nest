import React, { useState } from "react";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  FormatPaint as FormatPaintIcon,
} from "@mui/icons-material";
import StyledTextModal from "@/components/StyledTextModal";
import { Button, Box, TextField, Select, MenuItem } from "@mui/material";
import CollectionSlugPicker from "@/components/admin/CollectionSlugPicker";
import ShopifyCollectionPicker from "@/components/ShopifyCollectionPicker";

interface TopCategoriesEditorProps {
  data: any;
  onChange: (data: any) => void;
  openResourcePicker?: (
    onSelect: (slug: string) => void,
    type: "product" | "collection" | "page"
  ) => void;
}

export const TopCategoriesEditor: React.FC<TopCategoriesEditorProps> = ({
  data,
  onChange,
  // openResourcePicker, // We'll use internal picker
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addItem = () => {
    const currentItems = data.items || [];
    const newItems = [...currentItems, { title: "", slug: "", image: "" }];
    updateField("items", newItems);
  };

  const removeItem = (index: number) => {
    const currentItems = data.items || [];
    const newItems = currentItems.filter((_: any, i: number) => i !== index);
    updateField("items", newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const currentItems = data.items || [];
    const newItems = currentItems.map((item: any, i: number) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateField("items", newItems);
  };

  return (
    <div className="space-y-4">
      <div>
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
      </div>

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

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Subtitle</label>
        <TextField
          size="small"
          fullWidth
          value={data.subtitle || ""}
          onChange={(e) => updateField("subtitle", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Items</h3>
        {(data.items || []).map((item: any, index: number) => (
          <div
            key={index}
            className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4 relative"
          >
            <button
              onClick={() => removeItem(index)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <DeleteIcon fontSize="small" />
            </button>

            <div className="space-y-4">
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
              <ShopifyCollectionPicker
                label="Collection"
                value={item.slug || ""}
                onChange={(value) => updateItem(index, "slug", value as string)}
              />
              <div className="space-y-1.5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700">
                    Icon
                  </span>
                  <span className="text-[10px] text-slate-500">Ratio: 1:1</span>
                </div>
                <ShopifyImagePicker
                  label="Icon"
                  value={item.image || ""}
                  onChange={(url) => updateItem(index, "image", url)}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          className="text-sm text-[#408dfb] hover:text-indigo-700 font-medium inline-flex items-center gap-1"
        >
          <AddIcon fontSize="small" />
          Add Item
        </button>
      </div>
    </div>
  );
};
