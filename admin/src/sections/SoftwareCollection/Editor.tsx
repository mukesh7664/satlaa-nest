import React, { useState } from "react";
import { Stack, Button, Box, TextField, Select, MenuItem } from "@mui/material";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import StyledTextModal from "@/components/StyledTextModal";
import CollectionSlugPicker from "@/components/admin/CollectionSlugPicker";
import ShopifyCollectionPicker from "@/components/ShopifyCollectionPicker";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface SoftwareCollectionEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const SoftwareCollectionEditor: React.FC<
  SoftwareCollectionEditorProps
> = ({ data, onChange }) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);

  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FormatPaintIcon />}
          onClick={() => setStyleModalOpen(true)}
          sx={{ mb: 2 }}
        >
          Style Text Tool
        </Button>
        <StyledTextModal
          open={styleModalOpen}
          onClose={() => setStyleModalOpen(false)}
        />
      </Box>

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
            onChange={(e) => updateData("bgType", e.target.value)}
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
                onChange={(e) => updateData("bgColor", e.target.value)}
                className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
              />
              <TextField
                size="small"
                fullWidth
                value={data.bgColor || "#ffffff"}
                onChange={(e) => updateData("bgColor", e.target.value)}
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
              onChange={(e) => updateData("bgGradient", e.target.value)}
              placeholder="linear-gradient(to right, #ff0000, #0000ff)"
              sx={{ bgcolor: "white" }}
            />
          </div>
        )}

        {data.bgType === "image" && (
          <ShopifyImagePicker
            label="Background Image"
            value={data.backgroundImage || ""}
            onChange={(url) => updateData("backgroundImage", url)}
          />
        )}


      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateData("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Description
        </label>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={data.description || ""}
          onChange={(e) => updateData("description", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>
      <ShopifyCollectionPicker
        label="Collection Slugs"
        value={data.collectionSlugs || []}
        onChange={(value) => updateData("collectionSlugs", value)}
        multiple={true}
        helperText="Select collections to display in this section"
      />
    </Stack>
  );
};
