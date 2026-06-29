import React from "react";
import { TextField, Stack, Typography, Button, IconButton } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface HeroEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({ data, onChange }) => {
  const slides = data.slides || [];

  const updateSlideField = (index: number, field: string, value: any) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    onChange({ ...data, slides: newSlides });
  };

  const addSlide = () => {
    const newSlides = [
      ...slides,
      {
        subtitle: "PROFESSIONAL DENTAL EQUIPMENT",
        title: "Advanced Operatory Units & Dental Chairs",
        description: "Maximize patient comfort and clinical efficiency with our premium ergonomically-designed dental units.",
        image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1600&auto=format&fit=crop",
        buttonText: "Explore Dental Chairs",
        buttonLink: "/shop?category=chairs",
        alignment: "left",
        textColor: "#0f172a",
        badge: "NEW ARRIVALS"
      }
    ];
    onChange({ ...data, slides: newSlides });
  };

  const removeSlide = (index: number) => {
    const newSlides = slides.filter((_: any, i: number) => i !== index);
    onChange({ ...data, slides: newSlides });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Dental Premium Hero Slider Settings
      </Typography>

      <TextField
        label="Autoplay Speed (ms, e.g., 6000)"
        fullWidth
        size="small"
        type="number"
        value={data.autoplaySpeed || 6000}
        onChange={(e) => onChange({ ...data, autoplaySpeed: parseInt(e.target.value, 10) })}
      />

      <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
        Slides
      </Typography>

      {slides.map((slide: any, idx: number) => (
        <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1, position: "relative" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Slide #{idx + 1}
            </Typography>
            {slides.length > 1 && (
              <IconButton size="small" color="error" onClick={() => removeSlide(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <TextField
            label="Banner Badge (e.g. 50% OFF SPECIAL)"
            fullWidth
            size="small"
            value={slide.badge || ""}
            onChange={(e) => updateSlideField(idx, "badge", e.target.value)}
          />

          <TextField
            label="Subtitle (Upper small text)"
            fullWidth
            size="small"
            value={slide.subtitle || ""}
            onChange={(e) => updateSlideField(idx, "subtitle", e.target.value)}
          />

          <TextField
            label="Title"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={slide.title || ""}
            onChange={(e) => updateSlideField(idx, "title", e.target.value)}
          />

          <TextField
            label="Description"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={slide.description || ""}
            onChange={(e) => updateSlideField(idx, "description", e.target.value)}
          />

          <ShopifyImagePicker
            label="Background Image"
            value={slide.image || ""}
            onChange={(url) => updateSlideField(idx, "image", url)}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Button Text"
              fullWidth
              size="small"
              value={slide.buttonText || ""}
              onChange={(e) => updateSlideField(idx, "buttonText", e.target.value)}
            />
            <TextField
              label="Button Link"
              fullWidth
              size="small"
              value={slide.buttonLink || ""}
              onChange={(e) => updateSlideField(idx, "buttonLink", e.target.value)}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Text Color (e.g. #0f172a or #ffffff)"
              fullWidth
              size="small"
              value={slide.textColor || "#0f172a"}
              onChange={(e) => updateSlideField(idx, "textColor", e.target.value)}
            />
            <TextField
              label="Alignment (left / center / right)"
              fullWidth
              size="small"
              value={slide.alignment || "left"}
              onChange={(e) => updateSlideField(idx, "alignment", e.target.value)}
            />
          </Stack>
        </Stack>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addSlide} sx={{ mt: 2 }}>
        Add Slide
      </Button>
    </Stack>
  );
};
