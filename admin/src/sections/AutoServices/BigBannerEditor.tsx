import React from "react";
import { TextField, Stack, Typography, Button, IconButton, Box } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface BigBannerEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const BigBannerEditor: React.FC<BigBannerEditorProps> = ({ data, onChange }) => {
  const features = data.features || [];

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addFeature = () => {
    updateField("features", [...features, { title: "", description: "" }]);
  };

  const removeFeature = (index: number) => {
    updateField("features", features.filter((_: any, i: number) => i !== index));
  };

  const updateFeature = (index: number, field: string, value: any) => {
    const newFeatures = features.map((feat: any, i: number) => 
      i === index ? { ...feat, [field]: value } : feat
    );
    updateField("features", newFeatures);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary">AutoServices Big Banner Settings</Typography>
      
      <TextField
        label="Subtitle"
        fullWidth
        size="small"
        value={data.subtitle || ""}
        onChange={(e) => updateField("subtitle", e.target.value)}
      />

      <TextField
        label="Title"
        fullWidth
        size="small"
        multiline
        rows={2}
        value={data.title || ""}
        onChange={(e) => updateField("title", e.target.value)}
      />

      <TextField
        label="Description"
        fullWidth
        size="small"
        multiline
        rows={3}
        value={data.description || ""}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <ShopifyImagePicker
        label="Main Image"
        value={data.image || ""}
        onChange={(url) => updateField("image", url)}
      />

      <Typography variant="subtitle2">Features List</Typography>
      <Box className="space-y-4">
        {features.map((feat: any, index: number) => (
          <Box key={index} className="p-4 border rounded-lg bg-slate-50 relative">
            <IconButton 
              size="small" 
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
              onClick={() => removeFeature(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            
            <Stack spacing={2}>
              <TextField
                label="Feature Title"
                fullWidth
                size="small"
                value={feat.title || ""}
                onChange={(e) => updateFeature(index, "title", e.target.value)}
              />
              <TextField
                label="Feature Description"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={feat.description || ""}
                onChange={(e) => updateFeature(index, "description", e.target.value)}
              />
            </Stack>
          </Box>
        ))}
        
        <Button 
          startIcon={<AddIcon />} 
          variant="outlined" 
          size="small" 
          onClick={addFeature}
        >
          Add Feature
        </Button>
      </Box>
    </Stack>
  );
};
