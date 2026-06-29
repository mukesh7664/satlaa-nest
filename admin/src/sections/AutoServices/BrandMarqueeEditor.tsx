import React from "react";
import { TextField, Stack, Typography, Button, IconButton, Box } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface BrandMarqueeEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const BrandMarqueeEditor: React.FC<BrandMarqueeEditorProps> = ({ data, onChange }) => {
  const brands = data.brands || [];

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addBrand = () => {
    updateField("brands", [...brands, { name: "", logo: "" }]);
  };

  const removeBrand = (index: number) => {
    updateField("brands", brands.filter((_: any, i: number) => i !== index));
  };

  const updateBrand = (index: number, field: string, value: any) => {
    const newBrands = brands.map((brand: any, i: number) => 
      i === index ? { ...brand, [field]: value } : brand
    );
    updateField("brands", newBrands);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary">AutoServices Brand Marquee Settings</Typography>
      
      <Box className="space-y-4">
        {brands.map((brand: any, index: number) => (
          <Box key={index} className="p-4 border rounded-lg bg-slate-50 relative">
            <IconButton 
              size="small" 
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
              onClick={() => removeBrand(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            
            <Stack spacing={2}>
              <TextField
                label="Brand Name"
                fullWidth
                size="small"
                value={brand.name || ""}
                onChange={(e) => updateBrand(index, "name", e.target.value)}
              />
              <ShopifyImagePicker
                label="Brand Logo"
                value={brand.logo || ""}
                onChange={(url) => updateBrand(index, "logo", url)}
              />
            </Stack>
          </Box>
        ))}
        
        <Button 
          startIcon={<AddIcon />} 
          variant="outlined" 
          size="small" 
          onClick={addBrand}
        >
          Add Brand
        </Button>
      </Box>
    </Stack>
  );
};
