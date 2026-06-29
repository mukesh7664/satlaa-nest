import React, { useState } from "react";

import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import StyledTextModal from "@/components/StyledTextModal";
import { Button, TextField, Select, MenuItem } from "@mui/material";
import LinkPicker from "@/components/admin/LinkPicker";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface EmpoweringEditorProps {
  data: any;
  onChange: (data: any) => void;
  openResourcePicker?: (
    onSelect: (slug: string) => void,
    type: "product" | "collection" | "page"
  ) => void;
}

export const EmpoweringEditor: React.FC<EmpoweringEditorProps> = ({
  data,
  onChange,
  // openResourcePicker,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">

      <div>
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
      </div>
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
        <label className="text-sm font-medium text-slate-700">Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Content</label>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={data.content || ""}
          onChange={(e) => updateField("content", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>
      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <h4 className="text-sm font-semibold text-slate-800">Button 1</h4>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Text</label>
          <TextField
            size="small"
            fullWidth
            value={data.button1Text || ""}
            onChange={(e) => updateField("button1Text", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.button1BgColor || "#004DAA"}
              onChange={(e) => updateField("button1BgColor", e.target.value)}
              className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
            />
            <TextField
              size="small"
              fullWidth
              value={data.button1BgColor || "#004DAA"}
              onChange={(e) => updateField("button1BgColor", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>
        <LinkPicker
          label="Link"
          value={data.button1Link || ""}
          onChange={(value) => updateField("button1Link", value)}
          placeholder="/products"
          helperText="Select a page, product, or collection to link to"
          allowedTypes={["page", "product", "collection"]}
          collectionLinkFormat="query"
        />
      </div>
      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <h4 className="text-sm font-semibold text-slate-800">Button 2</h4>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Text</label>
          <TextField
            size="small"
            fullWidth
            value={data.button2Text || ""}
            onChange={(e) => updateField("button2Text", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.button2BgColor || "transparent"}
              onChange={(e) => updateField("button2BgColor", e.target.value)}
              className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
            />
            <TextField
              size="small"
              fullWidth
              value={data.button2BgColor || "transparent"}
              onChange={(e) => updateField("button2BgColor", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>
        <LinkPicker
          label="Link"
          value={data.button2Link || ""}
          onChange={(value) => updateField("button2Link", value)}
          placeholder="/products"
          helperText="Select a page, product, or collection to link to"
          allowedTypes={["page", "product", "collection"]}
          collectionLinkFormat="query"
        />
      </div>
    </div>
  );
};
