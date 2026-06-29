import React, { useState } from "react";
import StyledTextModal from "@/components/StyledTextModal";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import { Button, Box, TextField, IconButton, Select, MenuItem } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface StatsBannerEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const StatsBannerEditor: React.FC<StatsBannerEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddStat = () => {
    const currentStats = data.stats || [];
    updateField("stats", [
      ...currentStats,
      { metric: "100+", label: "New Stat" },
    ]);
  };

  const handleRemoveStat = (index: number) => {
    const currentStats = [...(data.stats || [])];
    currentStats.splice(index, 1);
    updateField("stats", currentStats);
  };

  const handleStatChange = (
    index: number,
    field: "metric" | "label",
    value: string
  ) => {
    const currentStats = [...(data.stats || [])];
    currentStats[index] = { ...currentStats[index], [field]: value };
    updateField("stats", currentStats);
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
            value={data.bgType || "gradient"} // Default to gradient to match existing
            onChange={(e) => updateField("bgType", e.target.value)}
            className="w-full bg-white"
            size="small"
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
              value={
                data.bgGradient ||
                "linear-gradient(to bottom right, #1e1c6b, #1a1a52, #12123b)"
              }
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
          placeholder="e.g. India's Largest Software Marketplace..."
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">
            Statistics
          </label>
          <button
            onClick={handleAddStat}
            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            <AddIcon fontSize="small" /> Add Stat
          </button>
        </div>

        <div className="space-y-3">
          {(data.stats || []).map((stat: any, index: number) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group"
            >
              <div className="flex-1 grid grid-cols-2 gap-3">
                <TextField
                  size="small"
                  fullWidth
                  value={stat.metric || ""}
                  onChange={(e) =>
                    handleStatChange(index, "metric", e.target.value)
                  }
                  placeholder="Metric (e.g. 2017)"
                  sx={{ bgcolor: "white" }}
                />
                <TextField
                  size="small"
                  fullWidth
                  value={stat.label || ""}
                  onChange={(e) =>
                    handleStatChange(index, "label", e.target.value)
                  }
                  placeholder="Label (e.g. Founded Year)"
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <IconButton
                size="small"
                onClick={() => handleRemoveStat(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </div>
          ))}
          {(data.stats || []).length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
              No stats added yet. Click "Add Stat" to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
