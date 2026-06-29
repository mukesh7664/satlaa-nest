import React from "react";
import { Box, Stack, Typography, Paper, Button, TextField } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface BrandItem {
  name: string;
  logo: string;
}

interface EcommerceBrandShowcaseEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const EcommerceBrandShowcaseEditor: React.FC<EcommerceBrandShowcaseEditorProps> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleUpdateItem = (index: number, field: keyof BrandItem, value: string) => {
    const newBrands = [...(data.brands || [])];
    newBrands[index] = { ...newBrands[index], [field]: value };
    updateData("brands", newBrands);
  };

  const handleAddItem = () => {
    const newBrands = [...(data.brands || []), { name: "New Brand", logo: "" }];
    updateData("brands", newBrands);
  };

  const handleRemoveItem = (index: number) => {
    const newBrands = data.brands.filter((_: any, i: number) => i !== index);
    updateData("brands", newBrands);
  };

  return (
    <Stack spacing={3}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Section Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateData("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Background Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={data.bgColor || "#ffffff"}
            onChange={(e) => updateData("bgColor", e.target.value)}
            className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
          />
          <TextField
            size="small"
            fullWidth
            value={data.bgColor || "#ffffff"}
            onChange={(e) => updateData("bgColor", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Partner Brand Logos
        </Typography>
        {data.brands?.map((item: BrandItem, index: number) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }} variant="outlined">
            <Stack spacing={2}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Brand Name</label>
                <TextField
                  size="small"
                  fullWidth
                  value={item.name || ""}
                  onChange={(e) => handleUpdateItem(index, "name", e.target.value)}
                  sx={{ bgcolor: "white" }}
                />
              </div>

              <ShopifyImagePicker
                label="Brand Logo SVG/Image"
                value={item.logo || ""}
                onChange={(url) => handleUpdateItem(index, "logo", url)}
              />

              <Button
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveItem(index)}
                sx={{ alignSelf: "flex-start" }}
              >
                Remove Brand
              </Button>
            </Stack>
          </Paper>
        ))}

        <Button startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined">
          Add Brand Logo
        </Button>
      </Box>
    </Stack>
  );
};
