import React from "react";
import { TextField, Stack, Typography, Button, IconButton } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";

interface BrandItem {
  name: string;
}

interface BrandCarouselEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const BrandCarouselEditor: React.FC<BrandCarouselEditorProps> = ({ data, onChange }) => {
  const brands: BrandItem[] = data.brands || [
    { name: "BLACK Beauty" },
    { name: "Salvador BEAUTY & LIFESTYLE" },
    { name: "The BLACK WORLD" },
    { name: "VOGUE" }
  ];

  const handleUpdateBrand = (index: number, name: string) => {
    const updated = [...brands];
    updated[index] = { name };
    onChange({ ...data, brands: updated });
  };

  const handleAddBrand = () => {
    const updated = [...brands, { name: "NEW BRAND" }];
    onChange({ ...data, brands: updated });
  };

  const handleRemoveBrand = (index: number) => {
    const updated = brands.filter((_, idx) => idx !== index);
    onChange({ ...data, brands: updated });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Brand Logos Carousel Settings
      </Typography>

      {brands.map((brand, idx) => (
        <Stack key={idx} direction="row" spacing={1} alignItems="center">
          <TextField
            label={`Brand Logo #${idx + 1}`}
            size="small"
            fullWidth
            value={brand.name}
            onChange={(e) => handleUpdateBrand(idx, e.target.value)}
          />
          <IconButton color="error" size="small" onClick={() => handleRemoveBrand(idx)}>
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ))}

      <Button
        variant="outlined"
        size="small"
        startIcon={<Add />}
        onClick={handleAddBrand}
        sx={{ textTransform: "none" }}
      >
        Add Brand Logo
      </Button>
    </Stack>
  );
};
