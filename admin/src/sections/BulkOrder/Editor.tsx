import React from "react";
import { Typography, TextField, Select, MenuItem } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import LinkPicker from "@/components/admin/LinkPicker";

interface BulkOrderEditorProps {
  data: {
    tagline?: string;
    title?: string;
    description?: string;
    image?: string;
    // Button 1
    button1Text?: string;
    button1Link?: string;
    // Button 2
    button2Text?: string;
    button2Link?: string;
    // Background
    bgType?: "color" | "gradient" | "image";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
  onChange: (data: any) => void;
}

export const BulkOrderEditor: React.FC<BulkOrderEditorProps> = ({
  data,
  onChange,
}) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
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

      {/* Main Image */}
      <div className="space-y-1.5">
        <Typography variant="subtitle2">Featured Image (Left Side)</Typography>
        <ShopifyImagePicker
          label="Featured Image"
          value={data.image || ""}
          onChange={(url) => updateField("image", url)}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-4 border rounded-lg p-4">
        <Typography variant="subtitle2">Text Content (Right Side)</Typography>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Tagline (Small)
          </label>
          <TextField
            size="small"
            fullWidth
            value={data.tagline || ""}
            onChange={(e) => updateField("tagline", e.target.value)}
            placeholder="e.g. For large orders"
            sx={{ bgcolor: "white" }}
          />
        </div>

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
      </div>

      {/* Buttons */}
      <div className="space-y-6 border rounded-lg p-4">
        <div className="space-y-4">
          <Typography variant="subtitle2" className="text-slate-500">
            Primary Button (Dark)
          </Typography>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Text</label>
            <TextField
              size="small"
              fullWidth
              value={data.button1Text || ""}
              onChange={(e) => updateField("button1Text", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
          <LinkPicker
            label="Link"
            value={data.button1Link || ""}
            onChange={(val) => updateField("button1Link", val)}
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <Typography variant="subtitle2" className="text-slate-500">
            Secondary Button (Outline)
          </Typography>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Text</label>
            <TextField
              size="small"
              fullWidth
              value={data.button2Text || ""}
              onChange={(e) => updateField("button2Text", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
          <LinkPicker
            label="Link"
            value={data.button2Link || ""}
            onChange={(val) => updateField("button2Link", val)}
          />
        </div>
      </div>
    </div>
  );
};
