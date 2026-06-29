import React from "react";
import { TextField, Stack, Typography } from "@mui/material";

interface NewsletterEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const NewsletterEditor: React.FC<NewsletterEditorProps> = ({ data, onChange }) => {
  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Dental Newsletter Box Settings
      </Typography>

      <TextField
        label="Title Header"
        fullWidth
        size="small"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <TextField
        label="Description / Benefits"
        fullWidth
        size="small"
        multiline
        rows={3}
        value={data.description || ""}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
      />

      <TextField
        label="Input Placeholder Text"
        fullWidth
        size="small"
        value={data.placeholder || ""}
        onChange={(e) => onChange({ ...data, placeholder: e.target.value })}
      />

      <TextField
        label="Action Button Label"
        fullWidth
        size="small"
        value={data.buttonText || ""}
        onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
      />
    </Stack>
  );
};
