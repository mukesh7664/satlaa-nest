import React from "react";
import { TextField, Stack, Typography, Button, IconButton, Box } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface CategoryGridEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const CategoryGridEditor: React.FC<CategoryGridEditorProps> = ({ data, onChange }) => {
  const categories = data.categories || [];

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addCategory = () => {
    updateField("categories", [...categories, { name: "", image: "", count: "0", link: "" }]);
  };

  const removeCategory = (index: number) => {
    updateField("categories", categories.filter((_: any, i: number) => i !== index));
  };

  const updateCategory = (index: number, field: string, value: any) => {
    const newCategories = categories.map((cat: any, i: number) => 
      i === index ? { ...cat, [field]: value } : cat
    );
    updateField("categories", newCategories);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary">AutoServices Category Grid Settings</Typography>
      
      <Box className="space-y-4">
        {categories.map((cat: any, index: number) => (
          <Box key={index} className="p-4 border rounded-lg bg-slate-50 relative">
            <IconButton 
              size="small" 
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
              onClick={() => removeCategory(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            
            <Stack spacing={2}>
              <TextField
                label="Category Name"
                fullWidth
                size="small"
                value={cat.name || ""}
                onChange={(e) => updateCategory(index, "name", e.target.value)}
              />
              <TextField
                label="Product Count (e.g. 5)"
                fullWidth
                size="small"
                value={cat.count || ""}
                onChange={(e) => updateCategory(index, "count", e.target.value)}
              />
              <TextField
                label="Link"
                fullWidth
                size="small"
                value={cat.link || ""}
                onChange={(e) => updateCategory(index, "link", e.target.value)}
              />
              <ShopifyImagePicker
                label="Category Image"
                value={cat.image || ""}
                onChange={(url) => updateCategory(index, "image", url)}
              />
            </Stack>
          </Box>
        ))}
        
        <Button 
          startIcon={<AddIcon />} 
          variant="outlined" 
          size="small" 
          onClick={addCategory}
        >
          Add Category
        </Button>
      </Box>
    </Stack>
  );
};
