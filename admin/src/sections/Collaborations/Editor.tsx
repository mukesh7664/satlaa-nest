import React, { useState } from "react";
import StyledTextModal from "@/components/StyledTextModal";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import { Button, Box, TextField, Select, MenuItem } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import ShopifyVideoPicker from "@/components/ShopifyVideoPicker";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";

interface CollaborationsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const CollaborationsEditor: React.FC<CollaborationsEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addContentLine = () => {
    const currentContent = data.content || [];
    updateField("content", [...currentContent, ""]);
  };

  const removeContentLine = (index: number) => {
    const currentContent = data.content || [];
    const newContent = currentContent.filter(
      (_: any, i: number) => i !== index
    );
    updateField("content", newContent);
  };

  const updateContentLine = (index: number, value: string) => {
    const currentContent = [...(data.content || [])];
    currentContent[index] = value;
    updateField("content", currentContent);
  };

  const handleImageChange = (url: string) => {
    // API expects images array
    updateField("images", [url]);
  };

  const image = data.images?.[0] || "";

  return (
    <div className="space-y-6">
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
      {/* General Settings */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Title</label>
          <TextField
            size="small"
            fullWidth
            value={data.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Our Events and Collaborations"
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
            rows={4}
            value={data.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Description..."
            sx={{ bgcolor: "white", minHeight: "96px" }}
          />
        </div>
      </div>

      {/* Media Settings */}
      <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Main Image
          </label>
          <ShopifyImagePicker
            label="Upload Image"
            value={image}
            onChange={handleImageChange}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Collaborations Video
          </label>
          <ShopifyVideoPicker
            label="Upload Video"
            value={data.video || ""}
            onChange={(url) => updateField("video", url)}
          />
        </div>
      </div>

      {/* Content List */}
      <div className="border-t border-slate-100 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Content / Features List
          </h3>
          <button
            onClick={addContentLine}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 rounded-md transition-colors"
          >
            <AddIcon fontSize="small" /> Add Line
          </button>
        </div>

        <div className="space-y-3">
          {(data.content || []).map((line: string, index: number) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="text-xs text-slate-400 w-6">#{index + 1}</span>
              <TextField
                size="small"
                fullWidth
                value={line}
                onChange={(e) => updateContentLine(index, e.target.value)}
                placeholder="Enter feature text..."
                sx={{ bgcolor: "white" }}
              />
              <button
                onClick={() => removeContentLine(index)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </div>
          ))}
          {(!data.content || data.content.length === 0) && (
            <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No content added yet. Click "Add Line" to start.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
