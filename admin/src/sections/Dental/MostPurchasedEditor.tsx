import React from "react";
import { TextField, Stack, Typography, Button, IconButton } from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface MostPurchasedEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const MostPurchasedEditor: React.FC<MostPurchasedEditorProps> = ({ data, onChange }) => {
  const specs = data.specs || [];

  const updateSpec = (idx: number, val: string) => {
    const newSpecs = [...specs];
    newSpecs[idx] = val;
    onChange({ ...data, specs: newSpecs });
  };

  const addSpec = () => {
    onChange({ ...data, specs: [...specs, "New product highlight feature"] });
  };

  const removeSpec = (idx: number) => {
    const newSpecs = specs.filter((_: any, i: number) => i !== idx);
    onChange({ ...data, specs: newSpecs });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Dental Deal Spotlight Settings
      </Typography>

      <TextField
        label="Spotlight Section Title"
        fullWidth
        size="small"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <TextField
        label="Subtitle (Upper small text)"
        fullWidth
        size="small"
        value={data.subtitle || ""}
        onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
      />

      <TextField
        label="Featured Product Name"
        fullWidth
        size="small"
        value={data.productName || ""}
        onChange={(e) => onChange({ ...data, productName: e.target.value })}
      />

      <TextField
        label="Product Description"
        fullWidth
        size="small"
        multiline
        rows={3}
        value={data.productDescription || ""}
        onChange={(e) => onChange({ ...data, productDescription: e.target.value })}
      />

      <Stack direction="row" spacing={2}>
        <TextField
          label="Deal Price"
          fullWidth
          size="small"
          value={data.price || ""}
          onChange={(e) => onChange({ ...data, price: e.target.value })}
        />
        <TextField
          label="Original Price"
          fullWidth
          size="small"
          value={data.originalPrice || ""}
          onChange={(e) => onChange({ ...data, originalPrice: e.target.value })}
        />
      </Stack>

      <TextField
        label="Countdown Target Date (e.g. 2026-06-30T00:00:00)"
        fullWidth
        size="small"
        value={data.countdownDate || ""}
        onChange={(e) => onChange({ ...data, countdownDate: e.target.value })}
      />

      <TextField
        label="Product Detail Link"
        fullWidth
        size="small"
        value={data.link || ""}
        onChange={(e) => onChange({ ...data, link: e.target.value })}
      />

      <ShopifyImagePicker
        label="Featured Product Image"
        value={data.image || ""}
        onChange={(url) => onChange({ ...data, image: url })}
      />

      <Typography variant="subtitle1" fontWeight="medium" sx={{ mt: 2 }}>
        Highlight Specifications Checklist
      </Typography>

      {specs.map((spec: string, idx: number) => (
        <Stack key={idx} direction="row" spacing={2} alignItems="center">
          <TextField
            label={`Spec #${idx + 1}`}
            fullWidth
            size="small"
            value={spec || ""}
            onChange={(e) => updateSpec(idx, e.target.value)}
          />
          {specs.length > 1 && (
            <IconButton size="small" color="error" onClick={() => removeSpec(idx)}>
              <DeleteIcon />
            </IconButton>
          )}
        </Stack>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addSpec}>
        Add Spec Line
      </Button>
    </Stack>
  );
};
