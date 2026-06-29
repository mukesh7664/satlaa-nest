import React from "react";
import {
  TextField,
  Typography,
  Paper,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface SportAboutEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const SportAboutEditor: React.FC<SportAboutEditorProps> = ({
  data,
  onChange,
}) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addFeature = () => {
    const features = data.features || [];
    updateField("features", [...features, "New Feature"]);
  };

  const removeFeature = (index: number) => {
    const features = [...(data.features || [])];
    features.splice(index, 1);
    updateField("features", features);
  };

  const updateFeature = (index: number, value: string) => {
    const features = [...(data.features || [])];
    features[index] = value;
    updateField("features", features);
  };

  return (
    <Stack spacing={4}>
      <Paper sx={{ p: 3, bgcolor: "slate.50" }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Visuals</Typography>
        <ShopifyImagePicker
          label="About Section Image"
          value={data.image || ""}
          onChange={(url) => updateField("image", url)}
        />
      </Paper>

      <Stack spacing={2}>
        <TextField
          label="Badge Text"
          fullWidth
          size="small"
          value={data.badge || ""}
          onChange={(e) => updateField("badge", e.target.value)}
        />
        <TextField
          label="About Title"
          fullWidth
          multiline
          rows={2}
          value={data.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
        />
        <TextField
          label="About Content"
          fullWidth
          multiline
          rows={4}
          value={data.content || ""}
          onChange={(e) => updateField("content", e.target.value)}
        />
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Features List</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addFeature}>Add</Button>
        </Stack>
        <Stack spacing={2}>
          {(data.features || []).map((feature: string, index: number) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
              />
              <IconButton size="small" color="error" onClick={() => removeFeature(index)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Stats Highlight</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Value (e.g. 10+)"
            fullWidth
            size="small"
            value={data.statsValue || ""}
            onChange={(e) => updateField("statsValue", e.target.value)}
          />
          <TextField
            label="Label"
            fullWidth
            size="small"
            value={data.statsLabel || ""}
            onChange={(e) => updateField("statsLabel", e.target.value)}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};
