import React from "react";
import { Stack, TextField, Select, MenuItem } from "@mui/material";
import DynamicFilterPicker from "@/components/DynamicFilterPicker";

interface EcommerceFeaturedProductsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const EcommerceFeaturedProductsEditor: React.FC<EcommerceFeaturedProductsEditorProps> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    const newData = { ...data, [key]: value };
    // Always force dynamic source type
    newData.productsSource = "dynamic";
    onChange(newData);
  };

  return (
    <Stack spacing={3}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Badge Text</label>
        <TextField
          size="small"
          fullWidth
          value={data.badgeText || ""}
          onChange={(e) => updateData("badgeText", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Section Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateData("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Section Subtitle</label>
        <TextField
          size="small"
          fullWidth
          multiline
          rows={2}
          value={data.subtitle || ""}
          onChange={(e) => updateData("subtitle", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5 p-3 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
        <DynamicFilterPicker
          label="Filter Products By"
          value={data.filter || null}
          onChange={(newFilter) => updateData("filter", newFilter)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Max Products Limit</label>
        <TextField
          size="small"
          fullWidth
          type="number"
          value={data.limit || 8}
          onChange={(e) => updateData("limit", parseInt(e.target.value) || 8)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Grid Columns</label>
          <Select
            size="small"
            fullWidth
            value={data.columns || 4}
            onChange={(e) => updateData("columns", e.target.value)}
            className="bg-white"
          >
            <MenuItem value={2}>2 Columns</MenuItem>
            <MenuItem value={3}>3 Columns</MenuItem>
            <MenuItem value={4}>4 Columns</MenuItem>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.bgColor || "#ffffff"}
              onChange={(e) => updateData("bgColor", e.target.value)}
              className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
            />
            <TextField
              size="small"
              fullWidth
              value={data.bgColor || "#ffffff"}
              onChange={(e) => updateData("bgColor", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>
      </div>
    </Stack>
  );
};
