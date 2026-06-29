import React from "react";
import { TextField, Stack, Typography, Button, IconButton, MenuItem } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

interface TrustFeaturesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TrustFeaturesEditor: React.FC<TrustFeaturesEditorProps> = ({ data, onChange }) => {
  const features = data.features || [];

  const updateFeatureField = (index: number, field: string, value: any) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ ...data, features: newFeatures });
  };

  const addFeature = () => {
    const newFeatures = [
      ...features,
      {
        icon: "shipping",
        title: "Free Fast Shipping",
        description: "Complimentary shipping on orders over $150 worldwide."
      }
    ];
    onChange({ ...data, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_: any, i: number) => i !== index);
    onChange({ ...data, features: newFeatures });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Cloth Trust Features Settings
      </Typography>

      <TextField
        label="Background Color (e.g. #fcfcfc or #ffffff)"
        fullWidth
        size="small"
        value={data.bgColor || "#fcfcfc"}
        onChange={(e) => onChange({ ...data, bgColor: e.target.value })}
      />

      <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
        Features
      </Typography>

      {features.map((item: any, idx: number) => (
        <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Feature #{idx + 1}
            </Typography>
            {features.length > 1 && (
              <IconButton size="small" color="error" onClick={() => removeFeature(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <TextField
            label="Icon"
            select
            fullWidth
            size="small"
            value={item.icon || "shipping"}
            onChange={(e) => updateFeatureField(idx, "icon", e.target.value)}
          >
            <MenuItem value="shipping">Truck (Shipping)</MenuItem>
            <MenuItem value="secure">Shield (Secure Payment)</MenuItem>
            <MenuItem value="returns">Refresh (Returns)</MenuItem>
            <MenuItem value="support">Headphones (Support)</MenuItem>
          </TextField>

          <TextField
            label="Feature Title"
            fullWidth
            size="small"
            value={item.title || ""}
            onChange={(e) => updateFeatureField(idx, "title", e.target.value)}
          />

          <TextField
            label="Feature Description"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={item.description || ""}
            onChange={(e) => updateFeatureField(idx, "description", e.target.value)}
          />
        </Stack>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addFeature} sx={{ mt: 2 }}>
        Add Feature Badge
      </Button>
    </Stack>
  );
};
