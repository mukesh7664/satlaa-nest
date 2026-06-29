import React from "react";
import {
  Button,
  IconButton,
  Stack,
  Paper,
  Typography,
  Alert,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import LinkPicker from "@/components/admin/LinkPicker";

interface GridItem {
  image?: string;
  title?: string;
  link?: string;
}

interface CategoryGridEditorProps {
  data: {
    title?: string;
    items?: GridItem[];
    bgType?: string;
    bgColor?: string;
    bgGradient?: string;
    backgroundImage?: string;
  };
  onChange: (data: any) => void;
}

export const CategoryGridEditor: React.FC<CategoryGridEditorProps> = ({
  data,
  onChange,
}) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...(data.items || [])];
    if (!newItems[index]) newItems[index] = {};
    newItems[index] = { ...newItems[index], [field]: value };
    updateField("items", newItems);
  };

  const addItem = () => {
    const newItems = [
      ...(data.items || []),
      { title: "", image: "", link: "" },
    ];
    updateField("items", newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...(data.items || [])];
    newItems.splice(index, 1);
    updateField("items", newItems);
  };

  return (
    <div className="space-y-6">
      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Layout Logic:</strong> This section displays items in a grid.
        Item #3 will automatically span 2 columns (Rectangle). All others are
        Squares. Recommended: 7 items (Row 1: 3 items, Row 2: 4 items).
      </Alert>

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

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Section Title (Optional)
        </label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g. Shop by Category"
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Typography variant="subtitle2">Grid Items</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addItem}
            size="small"
            variant="outlined"
          >
            Add Item
          </Button>
        </div>

        <Stack spacing={2}>
          {(data.items || []).map((item, index) => (
            <Paper
              key={index}
              sx={{ p: 2, bgcolor: "grey.50" }}
              variant="outlined"
            >
              <Stack spacing={2}>
                <div className="flex justify-between items-start">
                  <Typography
                    variant="caption"
                    className="font-bold text-slate-500"
                  >
                    {index === 2
                      ? "Item #3 (Wide Rectangle)"
                      : `Item #${index + 1} (Square)`}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeItem(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>

                <div className="space-y-1.5">
                  <ShopifyImagePicker
                    label="Image"
                    value={item.image || ""}
                    onChange={(url) => updateItem(index, "image", url)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Title (Overlay)
                  </label>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.title || ""}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    placeholder="e.g. Urlis"
                    sx={{ bgcolor: "white" }}
                  />
                </div>

                <LinkPicker
                  label="Link"
                  value={item.link || ""}
                  onChange={(val) => updateItem(index, "link", val)}
                />
              </Stack>
            </Paper>
          ))}
        </Stack>
      </div>
    </div>
  );
};
