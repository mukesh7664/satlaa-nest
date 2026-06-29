import React from "react";
import { TextField, Stack, Typography } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface RunningSplitBlockEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const RunningSplitBlockEditor: React.FC<RunningSplitBlockEditorProps> = ({ data, onChange }) => {
  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Running Split Banner Settings
      </Typography>

      <TextField
        label="Subtitle Label"
        fullWidth
        size="small"
        value={data.subtitle || "RUNNING SHOES"}
        onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
      />

      <TextField
        label="Title Header"
        fullWidth
        size="small"
        value={data.title || "Engineered for Balance & Speed"}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <TextField
        label="Description text"
        fullWidth
        size="small"
        multiline
        rows={3}
        value={data.description || ""}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
      />

      <TextField
        label="Action Button Label"
        fullWidth
        size="small"
        value={data.buttonText || "SHOP NOW"}
        onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
      />

      <TextField
        label="Target Link URL"
        fullWidth
        size="small"
        value={data.link || "/shop"}
        onChange={(e) => onChange({ ...data, link: e.target.value })}
      />

      <TextField
        label="Left Banner Subtitle"
        fullWidth
        size="small"
        value={data.leftSubtitle || "NEON ATHLETICS"}
        onChange={(e) => onChange({ ...data, leftSubtitle: e.target.value })}
      />

      <TextField
        label="Left Banner Description"
        fullWidth
        size="small"
        multiline
        rows={2}
        value={data.leftDescription || "Break through your personal bounds with high-density foam cores."}
        onChange={(e) => onChange({ ...data, leftDescription: e.target.value })}
      />

      <ShopifyImagePicker
        label="Left Banner Graphic Image"
        value={data.image || ""}
        onChange={(url) => onChange({ ...data, image: url })}
      />
    </Stack>
  );
};
