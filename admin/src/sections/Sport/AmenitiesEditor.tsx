import React from "react";
import {
  TextField,
  Typography,
  Paper,
  Stack,
  IconButton,
  Button,
  Grid,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface SportAmenitiesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const SportAmenitiesEditor: React.FC<SportAmenitiesEditorProps> = ({
  data,
  onChange,
}) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addAmenity = () => {
    const amenities = data.amenities || [];
    updateField("amenities", [...amenities, { title: "New Service", description: "Description", iconName: "Trophy" }]);
  };

  const removeAmenity = (index: number) => {
    const amenities = [...(data.amenities || [])];
    amenities.splice(index, 1);
    updateField("amenities", amenities);
  };

  const updateAmenity = (index: number, field: string, value: string) => {
    const amenities = [...(data.amenities || [])];
    amenities[index] = { ...amenities[index], [field]: value };
    updateField("amenities", amenities);
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <TextField
          label="Badge Text"
          fullWidth
          size="small"
          value={data.badge || ""}
          onChange={(e) => updateField("badge", e.target.value)}
        />
        <TextField
          label="Title"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Amenities Grid</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addAmenity}>Add Item</Button>
        </Stack>
        <Grid container spacing={3}>
          {(data.amenities || []).map((item: any, index: number) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Paper variant="outlined" sx={{ p: 2, position: "relative" }}>
                <IconButton 
                  size="small" 
                  color="error" 
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  onClick={() => removeAmenity(index)}
                >
                  <DeleteIcon />
                </IconButton>
                <Stack spacing={2}>
                  <TextField
                    label="Title"
                    fullWidth
                    size="small"
                    value={item.title || ""}
                    onChange={(e) => updateAmenity(index, "title", e.target.value)}
                  />
                  <TextField
                    label="Description"
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    value={item.description || ""}
                    onChange={(e) => updateAmenity(index, "description", e.target.value)}
                  />
                  <TextField
                    label="Icon Name (Trophy, Users, ShieldCheck, ShoppingBag)"
                    fullWidth
                    size="small"
                    value={item.iconName || ""}
                    onChange={(e) => updateAmenity(index, "iconName", e.target.value)}
                  />
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );
};
