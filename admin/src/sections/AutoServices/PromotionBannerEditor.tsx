import React from "react";
import { TextField, Stack, Typography, Button, IconButton, Box } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface PromotionBannerEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const PromotionBannerEditor: React.FC<PromotionBannerEditorProps> = ({ data, onChange }) => {
  const banners = data.banners || [];

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addBanner = () => {
    updateField("banners", [...banners, { title: "", subtitle: "", description: "", image: "", buttonText: "Shop Now", link: "" }]);
  };

  const removeBanner = (index: number) => {
    updateField("banners", banners.filter((_: any, i: number) => i !== index));
  };

  const updateBanner = (index: number, field: string, value: any) => {
    const newBanners = banners.map((banner: any, i: number) => 
      i === index ? { ...banner, [field]: value } : banner
    );
    updateField("banners", newBanners);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary">AutoServices Promotion Banners Settings</Typography>
      
      <Box className="space-y-4">
        {banners.map((banner: any, index: number) => (
          <Box key={index} className="p-4 border rounded-lg bg-slate-50 relative">
            <IconButton 
              size="small" 
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
              onClick={() => removeBanner(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            
            <Stack spacing={2}>
              <TextField
                label="Subtitle"
                fullWidth
                size="small"
                value={banner.subtitle || ""}
                onChange={(e) => updateBanner(index, "subtitle", e.target.value)}
              />
              <TextField
                label="Title"
                fullWidth
                size="small"
                value={banner.title || ""}
                onChange={(e) => updateBanner(index, "title", e.target.value)}
              />
              <TextField
                label="Description"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={banner.description || ""}
                onChange={(e) => updateBanner(index, "description", e.target.value)}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Button Text"
                  fullWidth
                  size="small"
                  value={banner.buttonText || ""}
                  onChange={(e) => updateBanner(index, "buttonText", e.target.value)}
                />
                <TextField
                  label="Link"
                  fullWidth
                  size="small"
                  value={banner.link || ""}
                  onChange={(e) => updateBanner(index, "link", e.target.value)}
                />
              </Stack>
              <ShopifyImagePicker
                label="Banner Image"
                value={banner.image || ""}
                onChange={(url) => updateBanner(index, "image", url)}
              />
            </Stack>
          </Box>
        ))}
        
        <Button 
          startIcon={<AddIcon />} 
          variant="outlined" 
          size="small" 
          onClick={addBanner}
        >
          Add Banner
        </Button>
      </Box>
    </Stack>
  );
};
