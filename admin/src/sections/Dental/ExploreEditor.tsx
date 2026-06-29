import React from "react";
import { TextField, Stack, Typography, Button, IconButton } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface ExploreEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const ExploreEditor: React.FC<ExploreEditorProps> = ({ data, onChange }) => {
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
        title: "New Dental Supplies",
        image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=600&auto=format&fit=crop",
        link: "/shop",
        count: "10 Items"
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
        Dental Category Explore Settings
      </Typography>

      <TextField
        label="Title"
        fullWidth
        size="small"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <TextField
        label="Subtitle"
        fullWidth
        size="small"
        value={data.subtitle || ""}
        onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
      />

      <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
        Category Blocks
      </Typography>

      {items.map((item: any, idx: number) => (
        <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Category #{idx + 1}
            </Typography>
            {items.length > 1 && (
              <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <TextField
            label="Category Title"
            fullWidth
            size="small"
            value={item.title || ""}
            onChange={(e) => updateItemField(idx, "title", e.target.value)}
          />

          <TextField
            label="Category Link"
            fullWidth
            size="small"
            value={item.link || ""}
            onChange={(e) => updateItemField(idx, "link", e.target.value)}
          />

          <TextField
            label="Item Count label (e.g. 84 Items)"
            fullWidth
            size="small"
            value={item.count || ""}
            onChange={(e) => updateItemField(idx, "count", e.target.value)}
          />

          <ShopifyImagePicker
            label="Category Cover Image"
            value={item.image || ""}
            onChange={(url) => updateItemField(idx, "image", url)}
          />
        </Stack>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 2 }}>
        Add Category
      </Button>
    </Stack>
  );
};
