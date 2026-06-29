import React from "react";
import { TextField, Stack, Typography, Select, MenuItem, FormControl, InputLabel, Slider, Box } from "@mui/material";
import DynamicFilterPicker, { SelectedFilter } from "@/components/DynamicFilterPicker";

interface ProductGridEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const ProductGridEditor: React.FC<ProductGridEditorProps> = ({ data, onChange }) => {
  const limit = data.limit || 8;
  const filter = data.filter || null;

  const updateField = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    if (field === "filter") {
      newData.productsSource = value ? "dynamic" : "static";
    }
    onChange(newData);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Shoes Product Grid Settings
      </Typography>

      <TextField
        label="Section Subtitle"
        fullWidth
        size="small"
        value={data.subtitle || "MUST HAVES"}
        onChange={(e) => updateField("subtitle", e.target.value)}
      />

      <TextField
        label="Section Title"
        fullWidth
        size="small"
        value={data.title || "RECOMMENDED FOR YOU"}
        onChange={(e) => updateField("title", e.target.value)}
      />

      <Stack spacing={3} sx={{ p: 2, border: "1px dashed #e2e8f0", borderRadius: 2, bgcolor: "#f8fafc" }}>
        <Typography variant="caption" color="textSecondary" fontWeight="bold">
          Dynamic Rules Setup (Overrides Default Demo Cards)
        </Typography>

        <DynamicFilterPicker
          label="Filter Products By"
          value={filter}
          onChange={(newFilter: SelectedFilter | null) => updateField("filter", newFilter)}
        />

        <Box>
          <Typography variant="caption" gutterBottom color="textSecondary" fontWeight="bold">
            Products Display Count ({limit})
          </Typography>
          <Slider
            value={limit}
            min={4}
            max={24}
            step={4}
            marks
            valueLabelDisplay="auto"
            onChange={(_, val) => updateField("limit", val)}
          />
        </Box>
      </Stack>
    </Stack>
  );
};
