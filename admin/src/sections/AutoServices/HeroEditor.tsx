import React from "react";
import { TextField, Stack, Typography } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface HeroEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary">AutoServices Hero Settings</Typography>
      
      <TextField
        label="Subtitle (Upper Text)"
        fullWidth
        size="small"
        value={data.subtitle || ""}
        onChange={(e) => updateField("subtitle", e.target.value)}
      />

      <TextField
        label="Title"
        fullWidth
        size="small"
        multiline
        rows={2}
        value={data.title || ""}
        onChange={(e) => updateField("title", e.target.value)}
      />

      <TextField
        label="Description"
        fullWidth
        size="small"
        multiline
        rows={3}
        value={data.description || ""}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <TextField
        label="Discount Badge Text (e.g. -42%)"
        fullWidth
        size="small"
        value={data.discountBadge || ""}
        onChange={(e) => updateField("discountBadge", e.target.value)}
      />

      <ShopifyImagePicker
        label="Hero Image"
        value={data.image || ""}
        onChange={(url) => updateField("image", url)}
      />

      <Stack direction="row" spacing={2}>
        <TextField
          label="Button Text"
          fullWidth
          size="small"
          value={data.buttonText || ""}
          onChange={(e) => updateField("buttonText", e.target.value)}
        />
        <TextField
          label="Button Link"
          fullWidth
          size="small"
          value={data.buttonLink || ""}
          onChange={(e) => updateField("buttonLink", e.target.value)}
        />
      </Stack>

      <TextField
        label="Background Color"
        fullWidth
        size="small"
        type="color"
        value={data.bgColor || "#ffffff"}
        onChange={(e) => updateField("bgColor", e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  );
};
