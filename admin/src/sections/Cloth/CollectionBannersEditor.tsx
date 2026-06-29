import React from "react";
import { TextField, Stack, Typography, Button, IconButton, MenuItem } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface CollectionBannersEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const CollectionBannersEditor: React.FC<CollectionBannersEditorProps> = ({ data, onChange }) => {
  const items = data.items || [];

  const updateItemField = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItems = [
      ...items,
      {
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
        subtitle: "GET IN STYLE",
        title: "Dresses & One-pieces",
        buttonText: "Shop Collection",
        link: "/shop",
        badge: "HOT"
      }
    ];
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    onChange({ ...data, items: newItems });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Cloth Collection Grid Banners Settings
      </Typography>

      <TextField
        label="Gap Size"
        select
        fullWidth
        size="small"
        value={data.gapSize || "medium"}
        onChange={(e) => onChange({ ...data, gapSize: e.target.value })}
      >
        <MenuItem value="small">Small</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="large">Large</MenuItem>
      </TextField>

      <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
        Banners
      </Typography>

      {items.map((item: any, idx: number) => (
        <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Banner #{idx + 1}
            </Typography>
            {items.length > 1 && (
              <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <TextField
            label="Banner Subtitle"
            fullWidth
            size="small"
            value={item.subtitle || ""}
            onChange={(e) => updateItemField(idx, "subtitle", e.target.value)}
          />

          <TextField
            label="Banner Title"
            fullWidth
            size="small"
            value={item.title || ""}
            onChange={(e) => updateItemField(idx, "title", e.target.value)}
          />

          <TextField
            label="Button Text"
            fullWidth
            size="small"
            value={item.buttonText || ""}
            onChange={(e) => updateItemField(idx, "buttonText", e.target.value)}
          />

          <TextField
            label="Redirect Link"
            fullWidth
            size="small"
            value={item.link || ""}
            onChange={(e) => updateItemField(idx, "link", e.target.value)}
          />

          <TextField
            label="Badge Text (e.g. HOT, SALE, NEW)"
            fullWidth
            size="small"
            value={item.badge || ""}
            onChange={(e) => updateItemField(idx, "badge", e.target.value)}
          />

          <ShopifyImagePicker
            label="Banner Background Image"
            value={item.image || ""}
            onChange={(url) => updateItemField(idx, "image", url)}
          />
        </Stack>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 2 }}>
        Add Banner
      </Button>
    </Stack>
  );
};
