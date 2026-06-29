import React, { useState } from "react";
import { Box, Stack, Typography, Paper, Button, TextField, Select, MenuItem } from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FormatPaint as FormatPaintIcon,
} from "@mui/icons-material";
import StyledTextModal from "@/components/StyledTextModal";
import ImageUploader from "@/components/ImageUploader";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import LinkPicker from "@/components/admin/LinkPicker";
import ShopifyVideoPicker from "@/components/ShopifyVideoPicker";

interface UnlockPotentialEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const UnlockPotentialEditor: React.FC<UnlockPotentialEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);

  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleUpdateProduct = (index: number, field: string, value: any) => {
    const newProducts = [...(data.floatingProducts || [])];
    newProducts[index] = { ...newProducts[index], [field]: value };
    updateData("floatingProducts", newProducts);
  };

  const handleAddProduct = () => {
    const newProducts = [
      ...(data.floatingProducts || []),
      { title: "", subtitle: "", icon: "" },
    ];
    updateData("floatingProducts", newProducts);
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = data.floatingProducts.filter(
      (_: any, i: number) => i !== index
    );
    updateData("floatingProducts", newProducts);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FormatPaintIcon />}
          onClick={() => setStyleModalOpen(true)}
          sx={{ mb: 2 }}
        >
          Style Text Tool
        </Button>
        <StyledTextModal
          open={styleModalOpen}
          onClose={() => setStyleModalOpen(false)}
        />
      </Box>

      {/* Background Settings */}
      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800">
          Background Settings
        </h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Type</label>
          <Select
            size="small"
            fullWidth
            value={data.bgType || "color"}
            onChange={(e) => updateData("bgType", e.target.value)}
            className="bg-white"
            inputProps={{ className: "bg-white" }}
          >
            <MenuItem value="color">Solid Color</MenuItem>
            <MenuItem value="gradient">Gradient</MenuItem>
            <MenuItem value="image">Image</MenuItem>
          </Select>
        </div>

        {data.bgType === "color" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Background Color
            </label>
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
        )}

        {data.bgType === "gradient" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              CSS Gradient
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.bgGradient || ""}
              onChange={(e) => updateData("bgGradient", e.target.value)}
              placeholder="linear-gradient(to right, #ff0000, #0000ff)"
              sx={{ bgcolor: "white" }}
            />
          </div>
        )}

        {data.bgType === "image" && (
          <ShopifyImagePicker
            label="Background Image"
            value={data.backgroundImage || ""}
            onChange={(url) => updateData("backgroundImage", url)}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateData("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Description
        </label>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={data.description || ""}
          onChange={(e) => updateData("description", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Box sx={{ maxWidth: 320 }}>
          <ShopifyVideoPicker
            label="Video Upload (Center Widget)"
            value={data.videoUrl || ""}
            onChange={(url) => updateData("videoUrl", url)}
          />
        </Box>

        <Box sx={{ maxWidth: 320 }}>
          <ShopifyImagePicker
            label="Main Image (Right Side)"
            value={data.image}
            onChange={(url) => updateData("image", url)}
          />
        </Box>
      </div>

      <Stack spacing={2}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Button Text
          </label>
          <TextField
            size="small"
            fullWidth
            value={data.buttonText || ""}
            onChange={(e) => updateData("buttonText", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Button Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.buttonBgColor || "#004DAA"}
              onChange={(e) => updateData("buttonBgColor", e.target.value)}
              className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
            />
            <TextField
              size="small"
              fullWidth
              value={data.buttonBgColor || "#004DAA"}
              onChange={(e) => updateData("buttonBgColor", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>
        <LinkPicker
          label="Button Link"
          value={data.buttonLink || ""}
          onChange={(value) => updateData("buttonLink", value)}
          placeholder="/products"
          helperText="Select a page, product, or collection to link to"
          allowedTypes={["page", "product", "collection"]}
          collectionLinkFormat="query"
        />
      </Stack>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Floating Products
        </Typography>
        {data.floatingProducts?.map((item: any, index: number) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
            <Stack spacing={2}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Product Title
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={item.title}
                  onChange={(e) =>
                    handleUpdateProduct(index, "title", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Subtitle
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={item.subtitle}
                  onChange={(e) =>
                    handleUpdateProduct(index, "subtitle", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <Box sx={{ width: "fit-content" }}>
                <ShopifyImagePicker
                  label="Icon"
                  value={item.icon}
                  onChange={(url) => handleUpdateProduct(index, "icon", url)}
                />
              </Box>
              <Button
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveProduct(index)}
                sx={{ alignSelf: "flex-start" }}
              >
                Remove Product
              </Button>
            </Stack>
          </Paper>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
          variant="outlined"
        >
          Add Product
        </Button>
      </Box>
    </Stack>
  );
};
