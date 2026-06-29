import React from "react";
import { TextField, Stack, Typography, Button, IconButton } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface InstagramEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const InstagramEditor: React.FC<InstagramEditorProps> = ({ data, onChange }) => {
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
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop",
        link: "https://instagram.com"
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
        Cloth Instagram Settings
      </Typography>

      <TextField
        label="Section Title"
        fullWidth
        size="small"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <TextField
        label="Section Subtitle"
        fullWidth
        size="small"
        value={data.subtitle || ""}
        onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
      />

      <TextField
        label="Hashtag / Handle (e.g. @cloth_fashion)"
        fullWidth
        size="small"
        value={data.hashtag || ""}
        onChange={(e) => onChange({ ...data, hashtag: e.target.value })}
      />

      <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
        Instagram Posts Grid (Recommended 5)
      </Typography>

      {items.map((item: any, idx: number) => (
        <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Post #{idx + 1}
            </Typography>
            {items.length > 1 && (
              <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <TextField
            label="Redirect URL"
            fullWidth
            size="small"
            value={item.link || ""}
            onChange={(e) => updateItemField(idx, "link", e.target.value)}
          />

          <ShopifyImagePicker
            label="Lifestyle Image"
            value={item.image || ""}
            onChange={(url) => updateItemField(idx, "image", url)}
          />
        </Stack>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 2 }}>
        Add Post Image
      </Button>
    </Stack>
  );
};
