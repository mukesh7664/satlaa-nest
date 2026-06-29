import React, { useState } from "react";
import StyledTextModal from "@/components/StyledTextModal";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import { Box, Stack, Typography, Paper, Button, TextField, Select, MenuItem } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface PowerfulFeaturesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const PowerfulFeaturesEditor: React.FC<PowerfulFeaturesEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleUpdateFeature = (index: number, field: string, value: any) => {
    const newFeatures = [...(data.features || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateData("features", newFeatures);
  };

  const handleAddFeature = () => {
    const newFeatures = [
      ...(data.features || []),
      { title: "", description: "", image: "" },
    ];
    updateData("features", newFeatures);
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = data.features.filter(
      (_: any, i: number) => i !== index
    );
    updateData("features", newFeatures);
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
      <ShopifyImagePicker
        label="Main Image"
        value={data.image}
        onChange={(url) => updateData("image", url)}
      />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Features
        </Typography>
        {data.features?.map((feature: any, index: number) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
            <Stack spacing={2}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Title
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={feature.title}
                  onChange={(e) =>
                    handleUpdateFeature(index, "title", e.target.value)
                  }
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
                  value={feature.description}
                  onChange={(e) =>
                    handleUpdateFeature(index, "description", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <Box sx={{ width: "fit-content" }}>
                <ShopifyImagePicker
                  label="Feature Image"
                  value={feature.image}
                  onChange={(url) => handleUpdateFeature(index, "image", url)}
                />
              </Box>
              <Button
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveFeature(index)}
                sx={{ alignSelf: "flex-start" }}
              >
                Remove Feature
              </Button>
            </Stack>
          </Paper>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddFeature}
          variant="outlined"
        >
          Add Feature
        </Button>
      </Box>
    </Stack>
  );
};
