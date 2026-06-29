import React from "react";
import { TextField, Stack, Typography } from "@mui/material";

interface NewsletterEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const NewsletterEditor: React.FC<NewsletterEditorProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary">AutoServices Newsletter Settings</Typography>
      
      <TextField
        label="Title"
        fullWidth
        size="small"
        value={data.title || ""}
        onChange={(e) => updateField("title", e.target.value)}
      />

      <TextField
        label="Description"
        fullWidth
        size="small"
        value={data.description || ""}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <TextField
        label="Discount (e.g. -35%)"
        fullWidth
        size="small"
        value={data.discount || ""}
        onChange={(e) => updateField("discount", e.target.value)}
      />

      <TextField
        label="Coupon Code"
        fullWidth
        size="small"
        value={data.couponCode || ""}
        onChange={(e) => updateField("couponCode", e.target.value)}
      />
    </Stack>
  );
};
