import React from "react";
import { Typography, Button, IconButton, Stack, Paper, TextField, Select, MenuItem } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import LinkPicker from "@/components/admin/LinkPicker";

interface LinkItem {
  label?: string;
  url?: string;
}

interface CollectionListEditorProps {
  data: {
    title?: string;
    buttonText?: string;
    buttonLink?: string;
    image?: string;
    items?: LinkItem[];
    // Background
    bgType?: "color" | "gradient" | "image";
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
  onChange: (data: any) => void;
}

export const CollectionListEditor: React.FC<CollectionListEditorProps> = ({
  data,
  onChange,
}) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addItem = () => {
    const newItems = [...(data.items || []), { label: "", url: "" }];
    updateField("items", newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...(data.items || [])];
    newItems.splice(index, 1);
    updateField("items", newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...(data.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    updateField("items", newItems);
  };

  return (
    <div className="space-y-6">
      {/* Background Settings */}
      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800">
          Background Settings
        </h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Type</label>
          <Select
            size="small"
            fullWidth
            value={data.bgType || "color"}
            onChange={(e) => updateField("bgType", e.target.value)}
            className="bg-white"
            inputProps={{ className: "bg-white" }}
          >
            <MenuItem value="color">Solid Color</MenuItem>
            <MenuItem value="gradient">Gradient</MenuItem>
            <MenuItem value="image">Image</MenuItem>
          </Select>
        </div>

        {data.bgType === "color" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={data.bgColor || "#ffffff"}
                onChange={(e) => updateField("bgColor", e.target.value)}
                className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
              />
              <TextField
                size="small"
                fullWidth
                value={data.bgColor || "#ffffff"}
                onChange={(e) => updateField("bgColor", e.target.value)}
                sx={{ bgcolor: "white" }}
              />
            </div>
          </div>
        )}

        {data.bgType === "gradient" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              CSS Gradient
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.bgGradient || ""}
              onChange={(e) => updateField("bgGradient", e.target.value)}
              placeholder="linear-gradient(to right, #ff0000, #0000ff)"
              sx={{ bgcolor: "white" }}
            />
          </div>
        )}

        {data.bgType === "image" && (
          <ShopifyImagePicker
            label="Background Image"
            value={data.backgroundImage || ""}
            onChange={(url) => updateField("backgroundImage", url)}
          />
        )}
      </div>

      {/* Header Content */}
      <div className="space-y-4 border rounded-lg p-4">
        <Typography variant="subtitle2">Header</Typography>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Title</label>
          <TextField
            size="small"
            fullWidth
            value={data.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <Typography variant="subtitle2" className="text-slate-500">
            CTA Button
          </Typography>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Button Text
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.buttonText || ""}
              onChange={(e) => updateField("buttonText", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
          <LinkPicker
            label="Button Link"
            value={data.buttonLink || ""}
            onChange={(val) => updateField("buttonLink", val)}
          />
        </div>
      </div>

      {/* Decorative Image */}
      <div className="space-y-1.5">
        <Typography variant="subtitle2">
          Decorative Image (Right Side)
        </Typography>
        <ShopifyImagePicker
          label="Select Image"
          value={data.image || ""}
          onChange={(url) => updateField("image", url)}
        />
      </div>

      {/* List Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Typography variant="subtitle2">Collection Links</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addItem}
            size="small"
            variant="outlined"
          >
            Add Link
          </Button>
        </div>

        <Stack spacing={2}>
          {(data.items || []).map((item, index) => (
            <Paper
              key={index}
              sx={{ p: 2, bgcolor: "grey.50" }}
              variant="outlined"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Label
                    </label>
                    <TextField
                      size="small"
                      fullWidth
                      value={item.label || ""}
                      onChange={(e) =>
                        updateItem(index, "label", e.target.value)
                      }
                      sx={{ bgcolor: "white" }}
                    />
                  </div>
                  <LinkPicker
                    label="Destination URL"
                    value={item.url || ""}
                    onChange={(val) => updateItem(index, "url", val)}
                  />
                </div>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeItem(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            </Paper>
          ))}
        </Stack>
      </div>
    </div>
  );
};
