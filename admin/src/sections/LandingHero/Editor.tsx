import React from "react";
import { Stack, TextField, Select, MenuItem } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface LandingHeroEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const LandingHeroEditor: React.FC<LandingHeroEditorProps> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <Stack spacing={3}>
      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800">Background Settings</h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Type</label>
          <Select
            size="small"
            fullWidth
            value={data.bgType || "gradient"}
            onChange={(e) => updateData("bgType", e.target.value)}
            className="bg-white"
          >
            <MenuItem value="color">Solid Color</MenuItem>
            <MenuItem value="gradient">Gradient</MenuItem>
            <MenuItem value="image">Image</MenuItem>
          </Select>
        </div>

        {data.bgType === "color" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={data.bgColor || "#0f172a"}
                onChange={(e) => updateData("bgColor", e.target.value)}
                className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
              />
              <TextField
                size="small"
                fullWidth
                value={data.bgColor || "#0f172a"}
                onChange={(e) => updateData("bgColor", e.target.value)}
                sx={{ bgcolor: "white" }}
              />
            </div>
          </div>
        )}

        {data.bgType === "gradient" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">CSS Gradient</label>
            <TextField
              size="small"
              fullWidth
              value={data.bgGradient || "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"}
              onChange={(e) => updateData("bgGradient", e.target.value)}
              placeholder="linear-gradient(to right, #ff0000, #0000ff)"
              sx={{ bgcolor: "white" }}
            />
          </div>
        )}

        {data.bgType === "image" && (
          <ShopifyImagePicker
            label="Background Image"
            value={data.imageUrl || ""}
            onChange={(url) => updateData("imageUrl", url)}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Badge Text</label>
        <TextField
          size="small"
          fullWidth
          value={data.badge || ""}
          onChange={(e) => updateData("badge", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Main Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateData("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Subtitle Description</label>
        <TextField
          size="small"
          fullWidth
          multiline
          rows={3}
          value={data.subtitle || ""}
          onChange={(e) => updateData("subtitle", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Primary CTA Text</label>
          <TextField
            size="small"
            fullWidth
            value={data.ctaText || ""}
            onChange={(e) => updateData("ctaText", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Primary CTA Link</label>
          <TextField
            size="small"
            fullWidth
            value={data.ctaLink || ""}
            onChange={(e) => updateData("ctaLink", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Secondary CTA Text</label>
          <TextField
            size="small"
            fullWidth
            value={data.secondaryCtaText || ""}
            onChange={(e) => updateData("secondaryCtaText", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Secondary CTA Link</label>
          <TextField
            size="small"
            fullWidth
            value={data.secondaryCtaLink || ""}
            onChange={(e) => updateData("secondaryCtaLink", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Trust Metrics Count</label>
          <TextField
            size="small"
            fullWidth
            value={data.trustCount || ""}
            onChange={(e) => updateData("trustCount", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Trust Metrics Text</label>
          <TextField
            size="small"
            fullWidth
            value={data.trustText || ""}
            onChange={(e) => updateData("trustText", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>

      {data.bgType !== "image" && (
        <ShopifyImagePicker
          label="Right Side Display Image"
          value={data.imageUrl || ""}
          onChange={(url) => updateData("imageUrl", url)}
        />
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Text Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={data.textColor || "#ffffff"}
            onChange={(e) => updateData("textColor", e.target.value)}
            className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
          />
          <TextField
            size="small"
            fullWidth
            value={data.textColor || "#ffffff"}
            onChange={(e) => updateData("textColor", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>
    </Stack>
  );
};
