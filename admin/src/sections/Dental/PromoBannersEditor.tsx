import React from "react";
import { TextField, Stack, Typography } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface PromoBannersEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const PromoBannersEditor: React.FC<PromoBannersEditorProps> = ({ data, onChange }) => {
  const items = data.items || [];

  const updateItemField = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Dental Dual Promotional Banners
      </Typography>

      {[0, 1].map((idx) => {
        const item = items[idx] || {};
        return (
          <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1 }}>
            <Typography variant="body2" fontWeight="bold" color="text.secondary">
              Banner #{idx + 1} ({idx === 0 ? "Left Column" : "Right Column"})
            </Typography>

            <TextField
              label="Badge (e.g. GET UP TO 50% FLAT)"
              fullWidth
              size="small"
              value={item.badge || ""}
              onChange={(e) => updateItemField(idx, "badge", e.target.value)}
            />

            <TextField
              label="Subtitle (Upper small text)"
              fullWidth
              size="small"
              value={item.subtitle || ""}
              onChange={(e) => updateItemField(idx, "subtitle", e.target.value)}
            />

            <TextField
              label="Banner Title"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={item.title || ""}
              onChange={(e) => updateItemField(idx, "title", e.target.value)}
            />

            <ShopifyImagePicker
              label="Banner Background Image"
              value={item.image || ""}
              onChange={(url) => updateItemField(idx, "image", url)}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Button Text"
                fullWidth
                size="small"
                value={item.buttonText || ""}
                onChange={(e) => updateItemField(idx, "buttonText", e.target.value)}
              />
              <TextField
                label="Redirect Link"
                fullWidth
                size="small"
                value={item.link || ""}
                onChange={(e) => updateItemField(idx, "link", e.target.value)}
              />
            </Stack>
          </Stack>
        );
      })}
    </Stack>
  );
};
