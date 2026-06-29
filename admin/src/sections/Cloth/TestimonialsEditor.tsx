import React from "react";
import { TextField, Stack, Typography, Button, IconButton } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface TestimonialsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({ data, onChange }) => {
  const testimonials = data.testimonials || [];

  const updateTestimonialField = (index: number, field: string, value: any) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    onChange({ ...data, testimonials: newTestimonials });
  };

  const addTestimonial = () => {
    const newTestimonials = [
      ...testimonials,
      {
        quote: "This brand makes absolutely premium shirts. Extremely happy with my purchase!",
        author: "Client Name",
        role: "Verified Purchaser",
        rating: 5,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
      }
    ];
    onChange({ ...data, testimonials: newTestimonials });
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = testimonials.filter((_: any, i: number) => i !== index);
    onChange({ ...data, testimonials: newTestimonials });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Cloth Testimonials Settings
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
        label="Background Color (e.g. #ffffff or #fcfcfc)"
        fullWidth
        size="small"
        value={data.bgColor || "#ffffff"}
        onChange={(e) => onChange({ ...data, bgColor: e.target.value })}
      />

      <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
        Testimonials
      </Typography>

      {testimonials.map((item: any, idx: number) => (
        <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Testimonial #{idx + 1}
            </Typography>
            {testimonials.length > 1 && (
              <IconButton size="small" color="error" onClick={() => removeTestimonial(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <TextField
            label="Client Quote"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={item.quote || ""}
            onChange={(e) => updateTestimonialField(idx, "quote", e.target.value)}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Author Name"
              fullWidth
              size="small"
              value={item.author || ""}
              onChange={(e) => updateTestimonialField(idx, "author", e.target.value)}
            />
            <TextField
              label="Author Role"
              fullWidth
              size="small"
              value={item.role || ""}
              onChange={(e) => updateTestimonialField(idx, "role", e.target.value)}
            />
          </Stack>

          <TextField
            label="Rating (1 to 5 Stars)"
            fullWidth
            size="small"
            type="number"
            value={item.rating || 5}
            onChange={(e) => updateTestimonialField(idx, "rating", parseInt(e.target.value, 10))}
          />

          <ShopifyImagePicker
            label="Author Profile Picture"
            value={item.image || ""}
            onChange={(url) => updateTestimonialField(idx, "image", url)}
          />
        </Stack>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addTestimonial} sx={{ mt: 2 }}>
        Add Testimonial
      </Button>
    </Stack>
  );
};
