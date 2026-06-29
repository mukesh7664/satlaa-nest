import React from "react";
import { Stack, TextField } from "@mui/material";

interface EcommercePromoBannerEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const EcommercePromoBannerEditor: React.FC<EcommercePromoBannerEditorProps> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <Stack spacing={3}>
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
        <label className="text-sm font-medium text-slate-700">Promo Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateData("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Promo Description</label>
        <TextField
          size="small"
          fullWidth
          multiline
          rows={3}
          value={data.description || ""}
          onChange={(e) => updateData("description", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Discount Percent (%)</label>
          <TextField
            size="small"
            fullWidth
            value={data.discountPercent || ""}
            onChange={(e) => updateData("discountPercent", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">End Date (ISO String or Format)</label>
          <TextField
            size="small"
            fullWidth
            value={data.endDate || ""}
            onChange={(e) => updateData("endDate", e.target.value)}
            placeholder="2026-12-31T23:59:59Z"
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">CTA Button Text</label>
          <TextField
            size="small"
            fullWidth
            value={data.ctaText || ""}
            onChange={(e) => updateData("ctaText", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">CTA Button Link</label>
          <TextField
            size="small"
            fullWidth
            value={data.ctaLink || ""}
            onChange={(e) => updateData("ctaLink", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Background Gradient CSS</label>
        <TextField
          size="small"
          fullWidth
          value={data.bgGradient || "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"}
          onChange={(e) => updateData("bgGradient", e.target.value)}
          placeholder="linear-gradient(135deg, #dc2626 0%, #991b1b 100%)"
          sx={{ bgcolor: "white" }}
        />
      </div>
    </Stack>
  );
};
