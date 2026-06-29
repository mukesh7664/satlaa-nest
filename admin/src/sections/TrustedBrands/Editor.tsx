import React, { useState } from "react";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FormatPaint as FormatPaintIcon,
} from "@mui/icons-material";
import StyledTextModal from "@/components/StyledTextModal";
import { Button, Box, TextField, IconButton, InputAdornment, Select, MenuItem } from "@mui/material";
import ResourcePicker from "@/components/admin/ResourcePicker";

interface TrustedBrandsEditorProps {
  data: any;
  onChange: (data: any) => void;

  openResourcePicker?: any; // Alignment
  hideButtonOptions?: boolean;
}

export const TrustedBrandsEditor: React.FC<TrustedBrandsEditorProps> = ({
  data,
  onChange,
  hideButtonOptions = false,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    onSelect: ((slug: string) => void) | null;
    initialType: "product" | "collection" | "page";
    allowedTypes?: ("product" | "collection" | "page")[];
    collectionLinkFormat?: "plain" | "query";
  }>({
    isOpen: false,
    onSelect: null,
    initialType: "product",
    allowedTypes: undefined,
    collectionLinkFormat: "plain",
  });

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addImage = (url: string) => {
    const currentImages = data.images || [];
    const newImages = [...currentImages, url];
    updateField("images", newImages);
  };

  const removeImage = (index: number) => {
    const currentImages = data.images || [];
    const newImages = currentImages.filter((_: any, i: number) => i !== index);
    updateField("images", newImages);
  };

  const openResourcePicker = (
    onSelect: (slug: string) => void,
    initialType: "product" | "collection" | "page",
    allowedTypes?: ("product" | "collection" | "page")[],
    collectionLinkFormat: "plain" | "query" = "plain"
  ) => {
    setPickerState({
      isOpen: true,
      onSelect,
      initialType,
      allowedTypes,
      collectionLinkFormat,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="col-span-1 md:col-span-2">
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
      <div className="space-y-1.5 col-span-1 md:col-span-2">
        <label className="text-sm font-medium text-slate-700">Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-slate-50 col-span-1 md:col-span-2">
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

      <div className="space-y-1.5 col-span-1 md:col-span-2">
        <label className="text-sm font-medium text-slate-700">Subtitle</label>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={data.subtitle || ""}
          onChange={(e) => updateField("subtitle", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>
      {!hideButtonOptions && (
        <>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Button Text
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.ctaText || ""}
              onChange={(e) => updateField("ctaText", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Button Link
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.ctaLink || ""}
              onChange={(e) => updateField("ctaLink", e.target.value)}
              sx={{ bgcolor: "white" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        openResourcePicker(
                          (slug) => updateField("ctaLink", slug),
                          "page",
                          ["page", "product", "collection"],
                          "query"
                        )
                      }
                      edge="end"
                      size="small"
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </>
      )}

      <div className="col-span-1 md:col-span-2 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Brand Logistics
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="w-28 space-y-1">
            <ShopifyImagePicker
              label="Add Logo"
              value=""
              onChange={addImage}
              aspectRatio="1/1"
            />
          </div>
          {(data.images || []).map((url: string, index: number) => (
            <div
              key={index}
              className="relative w-28 aspect-square border border-slate-200 rounded-lg p-2 bg-white flex items-center justify-center group"
            >
              <img
                src={url}
                alt={`Brand ${index + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-sm text-slate-400 hover:text-red-500 transition-colors border border-slate-200 opacity-0 group-hover:opacity-100"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ResourcePicker
        isOpen={pickerState.isOpen}
        onClose={() => setPickerState((prev) => ({ ...prev, isOpen: false }))}
        onSelect={(slug) => {
          if (pickerState.onSelect) {
            pickerState.onSelect(slug);
          }
        }}
        initialType={pickerState.initialType}
        allowedTypes={pickerState.allowedTypes}
        collectionLinkFormat={pickerState.collectionLinkFormat}
      />
    </div>
  );
};
