import React from "react";
import { TextField, Stack, Typography, Button, IconButton, Divider } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface SlideData {
  subtitle: string;
  title: string;
  description: string;
  bgBackdrop: string;
  shoeImage: string;
  buttonText: string;
}

interface HeroSliderEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const HeroSliderEditor: React.FC<HeroSliderEditorProps> = ({ data, onChange }) => {
  const slides: SlideData[] = data.slides || [
    {
      subtitle: "NEW ARRIVALS",
      title: "Mate Trainer Sneaker",
      description: "Engineered for daily agility and premium street aesthetics.",
      bgBackdrop: "bg-sky-100",
      shoeImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
      buttonText: "Buy now"
    }
  ];

  const handleUpdateSlide = (index: number, updatedFields: Partial<SlideData>) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], ...updatedFields };
    onChange({ ...data, slides: updated });
  };

  const handleAddSlide = () => {
    const updated = [
      ...slides,
      {
        subtitle: "NEW MODEL",
        title: "Sneaker Edition X",
        description: "Premium responsiveness with dynamic street support.",
        bgBackdrop: "bg-orange-100",
        shoeImage: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=600&auto=format&fit=crop",
        buttonText: "Buy now"
      }
    ];
    onChange({ ...data, slides: updated });
  };

  const handleRemoveSlide = (index: number) => {
    const updated = slides.filter((_, idx) => idx !== index);
    onChange({ ...data, slides: updated });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Hero Carousel Slider Settings
      </Typography>

      {slides.map((slide, idx) => (
        <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2, position: "relative" }}>
          <Stack direction="row" justifyContent="between" alignItems="center" sx={{ width: "100%" }}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary">
              {`SLIDE #${idx + 1}`}
            </Typography>
            {slides.length > 1 && (
              <IconButton color="error" size="small" onClick={() => handleRemoveSlide(idx)}>
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <TextField
            label="Subtitle"
            size="small"
            fullWidth
            value={slide.subtitle}
            onChange={(e) => handleUpdateSlide(idx, { subtitle: e.target.value })}
          />

          <TextField
            label="Title"
            size="small"
            fullWidth
            value={slide.title}
            onChange={(e) => handleUpdateSlide(idx, { title: e.target.value })}
          />

          <TextField
            label="Description"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={slide.description}
            onChange={(e) => handleUpdateSlide(idx, { description: e.target.value })}
          />

          <TextField
            label="Backdrop Class (Tailwind)"
            size="small"
            fullWidth
            value={slide.bgBackdrop}
            onChange={(e) => handleUpdateSlide(idx, { bgBackdrop: e.target.value })}
          />

          <ShopifyImagePicker
            label="Shoe Image"
            value={slide.shoeImage}
            onChange={(url) => handleUpdateSlide(idx, { shoeImage: url })}
          />

          <TextField
            label="Button CTA Text"
            size="small"
            fullWidth
            value={slide.buttonText}
            onChange={(e) => handleUpdateSlide(idx, { buttonText: e.target.value })}
          />
        </Stack>
      ))}

      <Button
        variant="outlined"
        size="small"
        startIcon={<Add />}
        onClick={handleAddSlide}
        sx={{ textTransform: "none" }}
      >
        Add Slide
      </Button>
    </Stack>
  );
};
