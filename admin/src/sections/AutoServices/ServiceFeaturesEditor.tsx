import React from "react";
import { TextField, Stack, Typography, Button, IconButton, Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface ServiceFeaturesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

const ICONS = ["Award", "DollarSign", "Target", "Truck", "Shield", "Zap"];

export const ServiceFeaturesEditor: React.FC<ServiceFeaturesEditorProps> = ({ data, onChange }) => {
  const features = data.features || [];

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addFeature = () => {
    updateField("features", [...features, { icon: "Award", title: "", description: "" }]);
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
      <Typography variant="subtitle2" color="primary">AutoServices Service Features Settings</Typography>
      
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
              <FormControl fullWidth size="small">
                <InputLabel>Icon</InputLabel>
                <Select
                  value={feat.icon || "Award"}
                  label="Icon"
                  onChange={(e) => updateFeature(index, "icon", e.target.value)}
                >
                  {ICONS.map(icon => (
                    <MenuItem key={icon} value={icon}>{icon}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Title"
                fullWidth
                size="small"
                value={feat.title || ""}
                onChange={(e) => updateFeature(index, "title", e.target.value)}
              />
              <TextField
                label="Description"
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
