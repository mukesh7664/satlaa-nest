import React from "react";
import {
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import LinkPicker from "@/components/admin/LinkPicker";

interface SportHeroEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const SportHeroEditor: React.FC<SportHeroEditorProps> = ({
  data,
  onChange,
}) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Stack spacing={4}>
      <Paper sx={{ p: 3, bgcolor: "slate.50" }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Visuals</Typography>
        <ShopifyImagePicker
          label="Background Image"
          value={data.backgroundImage || ""}
          onChange={(url) => updateField("backgroundImage", url)}
        />
      </Paper>

      <Stack spacing={2}>
        <TextField
          label="Subtitle (Top Badge)"
          fullWidth
          size="small"
          value={data.subtitle || ""}
          onChange={(e) => updateField("subtitle", e.target.value)}
          placeholder="Elevate The Games"
        />
        <TextField
          label="Main Title"
          fullWidth
          multiline
          rows={2}
          value={data.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
        />
        <TextField
          label="Description Content"
          fullWidth
          multiline
          rows={4}
          value={data.content || ""}
          onChange={(e) => updateField("content", e.target.value)}
        />
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Call to Actions</Typography>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">Primary Button</Typography>
            <TextField
              label="Text"
              fullWidth
              size="small"
              value={data.primaryCtaText || ""}
              onChange={(e) => updateField("primaryCtaText", e.target.value)}
            />
            <LinkPicker
              label="Link"
              value={data.primaryCtaLink || ""}
              onChange={(val) => updateField("primaryCtaLink", val)}
              allowedTypes={["page", "product", "collection"]}
            />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">Secondary Button</Typography>
            <TextField
              label="Text"
              fullWidth
              size="small"
              value={data.secondaryCtaText || ""}
              onChange={(e) => updateField("secondaryCtaText", e.target.value)}
            />
            <LinkPicker
              label="Link"
              value={data.secondaryCtaLink || ""}
              onChange={(val) => updateField("secondaryCtaLink", val)}
              allowedTypes={["page", "product", "collection"]}
            />
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};
