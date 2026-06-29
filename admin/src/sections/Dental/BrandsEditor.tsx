import React from "react";
import { TextField, Stack, Typography, Button, IconButton } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

interface BrandsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const BrandsEditor: React.FC<BrandsEditorProps> = ({ data, onChange }) => {
  const items = data.items || [];

  const updateBrandField = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  const addBrand = () => {
    const newItems = [...items, { name: "New Dental Manufacturer", logo: "" }];
    onChange({ ...data, items: newItems });
  };

  const removeBrand = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    onChange({ ...data, items: newItems });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Dental Brand Partners Settings
      </Typography>

      <TextField
        label="Title Label (e.g. PARTNERS WITH LEADING MANUFACTURERS)"
        fullWidth
        size="small"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
        Brand Partners
      </Typography>

      {items.map((item: any, idx: number) => (
        <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Brand #{idx + 1}
            </Typography>
            {items.length > 1 && (
              <IconButton size="small" color="error" onClick={() => removeBrand(idx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <TextField
            label="Manufacturer Brand Name"
            fullWidth
            size="small"
            value={item.name || ""}
            onChange={(e) => updateBrandField(idx, "name", e.target.value)}
          />
        </Stack>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addBrand} sx={{ mt: 2 }}>
        Add Brand Partner
      </Button>
    </Stack>
  );
};
