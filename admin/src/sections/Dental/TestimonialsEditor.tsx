import React from "react";
import { TextField, Stack, Typography, Button, IconButton } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface TestimonialsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({ data, onChange }) => {
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
        quote: "Review quote goes here...",
        author: "Dr. Name",
        designation: "General Dentist",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1594824813573-246434e3b96f?q=80&w=150&auto=format&fit=crop"
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
        Dental Testimonials Slider Settings
      </Typography>

      <TextField
        label="Title"
        fullWidth
        size="small"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <TextField
        label="Subtitle (Upper small text)"
        fullWidth
        size="small"
        value={data.subtitle || ""}
        onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
      />

      <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
        Testimonials Slides
      </Typography>

      {items.map((item: any, idx: number) => (
        <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Review slide #{idx + 1}
            </Typography>
            {items.length > 1 && (
              <IconButton size="small" color="error" onClick={() => removeItem(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <TextField
            label="Reviewer Quote"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={item.quote || ""}
            onChange={(e) => updateItemField(idx, "quote", e.target.value)}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Doctor / Author Name"
              fullWidth
              size="small"
              value={item.author || ""}
              onChange={(e) => updateItemField(idx, "author", e.target.value)}
            />
            <TextField
              label="Designation (e.g. Sr. Orthodontist)"
              fullWidth
              size="small"
              value={item.designation || ""}
              onChange={(e) => updateItemField(idx, "designation", e.target.value)}
            />
          </Stack>

          <TextField
            label="Rating Stars (1-5)"
            fullWidth
            size="small"
            type="number"
            value={item.rating || 5}
            onChange={(e) => updateItemField(idx, "rating", parseInt(e.target.value, 10))}
          />

          <ShopifyImagePicker
            label="Avatar Photo"
            value={item.avatar || ""}
            onChange={(url) => updateItemField(idx, "avatar", url)}
          />
        </Stack>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 2 }}>
        Add Testimonial Quote
      </Button>
    </Stack>
  );
};
