import React from "react";
import { TextField, Stack, Typography } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface BasketballSplitBlockEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const BasketballSplitBlockEditor: React.FC<BasketballSplitBlockEditorProps> = ({ data, onChange }) => {
  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Basketball Inverted Split Settings
      </Typography>

      <TextField
        label="Subtitle Label"
        fullWidth
        size="small"
        value={data.subtitle || "BASKETBALL SHOES"}
        onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
      />

      <TextField
        label="Title Header"
        fullWidth
        size="small"
        value={data.title || "High-Top Court Dominance"}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <TextField
        label="Description text"
        fullWidth
        size="small"
        multiline
        rows={3}
        value={data.description || ""}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
      />

      <TextField
        label="Action Button Label"
        fullWidth
        size="small"
        value={data.buttonText || "SHOP NOW"}
        onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
      />

      <TextField
        label="Target Link URL"
        fullWidth
        size="small"
        value={data.link || "/shop"}
        onChange={(e) => onChange({ ...data, link: e.target.value })}
      />

      <TextField
        label="Right Banner Subtitle"
        fullWidth
        size="small"
        value={data.rightSubtitle || "COURT EXPLORERS"}
        onChange={(e) => onChange({ ...data, rightSubtitle: e.target.value })}
      />

      <TextField
        label="Right Banner Description"
        fullWidth
        size="small"
        multiline
        rows={2}
        value={data.rightDescription || "Engineered side wings for maximum lateral containment."}
        onChange={(e) => onChange({ ...data, rightDescription: e.target.value })}
      />

      <ShopifyImagePicker
        label="Right Banner Graphic Image"
        value={data.image || ""}
        onChange={(url) => onChange({ ...data, image: url })}
      />
    </Stack>
  );
};
