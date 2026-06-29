import React from "react";
import { TextField, Stack, Typography } from "@mui/material";

interface PartFinderEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const PartFinderEditor: React.FC<PartFinderEditorProps> = ({ data, onChange }) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary">AutoServices Part Finder Settings</Typography>
      
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
        multiline
        rows={3}
        value={data.description || ""}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <TextField
        label="Bottom Note"
        fullWidth
        size="small"
        multiline
        rows={2}
        value={data.note || ""}
        onChange={(e) => updateField("note", e.target.value)}
      />
    </Stack>
  );
};
