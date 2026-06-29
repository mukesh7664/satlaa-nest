import React, { useState } from "react";
import ShopifyVideoPicker from "@/components/ShopifyVideoPicker";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import StyledTextModal from "@/components/StyledTextModal";
import LinkPicker from "@/components/admin/LinkPicker";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  IconButton,
  Stack,
  Paper,
  Typography,
  TextField,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface HeroEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const ServiceHeroEditor: React.FC<HeroEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const currentVariant = data.variant || "standard";

  return (
    <div className="space-y-6">
      {/* Layout Variant Toggle */}
      <div className="space-y-1.5 border rounded-lg p-4 bg-blue-50 border-blue-100">
        <label className="text-sm font-semibold text-blue-800">Hero Layout Type</label>
        <Select
          size="small"
          fullWidth
          value={currentVariant}
          onChange={(e) => updateField("variant", e.target.value)}
          sx={{ bgcolor: "white" }}
        >
          <MenuItem value="standard">Standard (Software/General)</MenuItem>
        </Select>
      </div>

      {/* Style Text Tool - Top */}
      <div>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FormatPaintIcon />}
          onClick={() => setStyleModalOpen(true)}
          fullWidth
        >
          Style Text Tool
        </Button>
        <StyledTextModal
          open={styleModalOpen}
          onClose={() => setStyleModalOpen(false)}
        />
      </div>
      <div className="space-y-4">
        {/* Background Settings */}
        <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
          <Typography variant="subtitle2">Background Settings</Typography>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Type</label>
            <Select
              size="small"
              fullWidth
              value={data.bgType || "image"}
              onChange={(e) => updateField("bgType", e.target.value)}
              className="bg-white"
            >
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="color">Solid Color</MenuItem>
              <MenuItem value="gradient">Gradient</MenuItem>
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
              <p className="text-xs text-slate-500">
                Enter a valid CSS gradient value
              </p>
            </div>
          )}

          {(!data.bgType || data.bgType === "image") && (
            <ShopifyImagePicker
              label="Background Image"
              value={data.backgroundImage || ""}
              onChange={(url) => updateField("backgroundImage", url)}
            />
          )}

          <div className="pt-2 border-t mt-2">
            <ShopifyImagePicker
              label="Hero Image (Main Visual)"
              value={data.image || ""}
              onChange={(url) => {
                const newData = {
                  ...data,
                  image: url,
                  rightBannerImage: url, // Sync legacy field if needed
                };
                onChange(newData);
              }}
            />
          </div>
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
          <label className="text-sm font-medium text-slate-700">Highlighted Text (Blue Color)</label>
          <TextField
            size="small"
            fullWidth
            value={data.highlightedText || ""}
            onChange={(e) => updateField("highlightedText", e.target.value)}
            placeholder="Text within title to highlight"
            sx={{ bgcolor: "white" }}
          />
        </div>

        {currentVariant === "standard" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Pretitle / Subtitle
              </label>
              <TextField
                size="small"
                fullWidth
                value={data.subtitle || ""}
                onChange={(e) => updateField("subtitle", e.target.value)}
                placeholder="e.g. Click. Compare. Choose."
                sx={{ bgcolor: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Button Text
              </label>
              <TextField
                size="small"
                fullWidth
                value={data.buttonText || ""}
                onChange={(e) => updateField("buttonText", e.target.value)}
                placeholder="e.g. Get Started"
                sx={{ bgcolor: "white" }}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Content / Description
          </label>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={data.content || data.description || ""}
            onChange={(e) => {
              onChange({
                ...data,
                content: e.target.value,
                description: e.target.value,
              });
            }}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>
    </div>
  );
};
