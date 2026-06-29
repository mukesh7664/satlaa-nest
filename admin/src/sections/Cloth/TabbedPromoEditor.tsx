import React from "react";
import { TextField, Stack, Typography } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface TabbedPromoEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TabbedPromoEditor: React.FC<TabbedPromoEditorProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Cloth Promo Countdown Settings
      </Typography>

      <Typography variant="subtitle2" sx={{ mt: 1, textDecoration: "underline" }}>
        Left Banner Block
      </Typography>

      <TextField
        label="Left Banner Subtitle"
        fullWidth
        size="small"
        value={data.bannerSubtitle || ""}
        onChange={(e) => updateField("bannerSubtitle", e.target.value)}
      />

      <TextField
        label="Left Banner Title"
        fullWidth
        size="small"
        value={data.bannerTitle || ""}
        onChange={(e) => updateField("bannerTitle", e.target.value)}
      />

      <TextField
        label="Left Banner Redirect Link"
        fullWidth
        size="small"
        value={data.bannerLink || ""}
        onChange={(e) => updateField("bannerLink", e.target.value)}
      />

      <TextField
        label="Left Banner Button Text"
        fullWidth
        size="small"
        value={data.bannerButtonText || ""}
        onChange={(e) => updateField("bannerButtonText", e.target.value)}
      />

      <ShopifyImagePicker
        label="Left Banner Image"
        value={data.bannerImage || ""}
        onChange={(url) => updateField("bannerImage", url)}
      />

      <TextField
        label="Discount Tag (e.g. Save Up To 40%)"
        fullWidth
        size="small"
        value={data.discountPercent || ""}
        onChange={(e) => updateField("discountPercent", e.target.value)}
      />

      <Typography variant="subtitle2" sx={{ mt: 2, textDecoration: "underline" }}>
        Right Deal / Countdown Block
      </Typography>

      <TextField
        label="Promo Subtitle"
        fullWidth
        size="small"
        value={data.subtitle || ""}
        onChange={(e) => updateField("subtitle", e.target.value)}
      />

      <TextField
        label="Promo Title"
        fullWidth
        size="small"
        multiline
        rows={2}
        value={data.title || ""}
        onChange={(e) => updateField("title", e.target.value)}
      />

      <TextField
        label="Promo Description"
        fullWidth
        size="small"
        multiline
        rows={3}
        value={data.description || ""}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <TextField
        label="Countdown Target Date (e.g., 2026-10-01T00:00:00)"
        fullWidth
        size="small"
        placeholder="YYYY-MM-DDTHH:MM:SS"
        value={data.countdownDate || ""}
        onChange={(e) => updateField("countdownDate", e.target.value)}
      />

      <Stack direction="row" spacing={2}>
        <TextField
          label="Button Text"
          fullWidth
          size="small"
          value={data.ctaText || ""}
          onChange={(e) => updateField("ctaText", e.target.value)}
        />
        <TextField
          label="Button Link"
          fullWidth
          size="small"
          value={data.ctaLink || ""}
          onChange={(e) => updateField("ctaLink", e.target.value)}
        />
      </Stack>
    </Stack>
  );
};
