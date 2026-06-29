import React from "react";
import { Box, Stack, Typography, Paper, Button, TextField } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface CategoryItem {
  name: string;
  image: string;
  slug: string;
}

interface EcommerceCategoriesGridEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const EcommerceCategoriesGridEditor: React.FC<EcommerceCategoriesGridEditorProps> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleUpdateItem = (index: number, field: keyof CategoryItem, value: string) => {
    const newCategories = [...(data.categories || [])];
    newCategories[index] = { ...newCategories[index], [field]: value };
    updateData("categories", newCategories);
  };

  const handleAddItem = () => {
    const newCategories = [...(data.categories || []), { name: "New Category", image: "", slug: "new-category" }];
    updateData("categories", newCategories);
  };

  const handleRemoveItem = (index: number) => {
    const newCategories = data.categories.filter((_: any, i: number) => i !== index);
    updateData("categories", newCategories);
  };

  return (
    <Stack spacing={3}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Badge Text</label>
        <TextField
          size="small"
          fullWidth
          value={data.badge || ""}
          onChange={(e) => updateData("badge", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

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
        <label className="text-sm font-medium text-slate-700">Section Subtitle</label>
        <TextField
          size="small"
          fullWidth
          multiline
          rows={2}
          value={data.subtitle || ""}
          onChange={(e) => updateData("subtitle", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Background Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={data.bgColor || "#f8fafc"}
            onChange={(e) => updateData("bgColor", e.target.value)}
            className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
          />
          <TextField
            size="small"
            fullWidth
            value={data.bgColor || "#f8fafc"}
            onChange={(e) => updateData("bgColor", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Categories Showcase Grid
        </Typography>
        {data.categories?.map((item: CategoryItem, index: number) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }} variant="outlined">
            <Stack spacing={2}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Category Name</label>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.name || ""}
                    onChange={(e) => handleUpdateItem(index, "name", e.target.value)}
                    sx={{ bgcolor: "white" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Target Category Slug</label>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.slug || ""}
                    onChange={(e) => handleUpdateItem(index, "slug", e.target.value)}
                    sx={{ bgcolor: "white" }}
                  />
                </div>
              </div>

              <ShopifyImagePicker
                label="Showcase Display Image"
                value={item.image || ""}
                onChange={(url) => handleUpdateItem(index, "image", url)}
              />

              <Button
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveItem(index)}
                sx={{ alignSelf: "flex-start" }}
              >
                Remove Category
              </Button>
            </Stack>
          </Paper>
        ))}

        <Button startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined">
          Add Category Card
        </Button>
      </Box>
    </Stack>
  );
};
