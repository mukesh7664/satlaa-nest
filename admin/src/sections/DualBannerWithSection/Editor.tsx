import React from "react";
import { Typography, Paper, TextField } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import LinkPicker from "@/components/admin/LinkPicker";

interface BannerBlock {
  bgColor?: string;
  tagline?: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
}

interface DualBannerWithSectionEditorProps {
  data: {
    block1?: BannerBlock;
    block2?: BannerBlock;
  };
  onChange: (data: any) => void;
}

export const DualBannerWithSectionEditor: React.FC<
  DualBannerWithSectionEditorProps
> = ({ data, onChange }) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateBlock = (
    blockKey: "block1" | "block2",
    field: string,
    value: any
  ) => {
    const currentBlock = data[blockKey] || {};
    updateField(blockKey, { ...currentBlock, [field]: value });
  };

  const renderBlockEditor = (blockKey: "block1" | "block2", title: string) => {
    const blockData = data[blockKey] || {};

    return (
      <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontSize: "1rem", fontWeight: 600 }}
        >
          {title}
        </Typography>

        <div className="space-y-4">
          {/* Background Color */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={blockData.bgColor || "#f5f5f5"}
                onChange={(e) =>
                  updateBlock(blockKey, "bgColor", e.target.value)
                }
                className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
              />
              <TextField
                size="small"
                fullWidth
                value={blockData.bgColor || "#f5f5f5"}
                onChange={(e) =>
                  updateBlock(blockKey, "bgColor", e.target.value)
                }
                sx={{ bgcolor: "white" }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Small Label (Tagline)
            </label>
            <TextField
              size="small"
              fullWidth
              value={blockData.tagline || ""}
              onChange={(e) => updateBlock(blockKey, "tagline", e.target.value)}
              placeholder="e.g. New In"
              sx={{ bgcolor: "white" }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <TextField
              size="small"
              fullWidth
              value={blockData.title || ""}
              onChange={(e) => updateBlock(blockKey, "title", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>

          {/* Button */}
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Button Text
              </label>
              <TextField
                size="small"
                fullWidth
                value={blockData.buttonText || ""}
                onChange={(e) =>
                  updateBlock(blockKey, "buttonText", e.target.value)
                }
                sx={{ bgcolor: "white" }}
              />
            </div>
            <LinkPicker
              label="Button Link"
              value={blockData.buttonLink || ""}
              onChange={(val) => updateBlock(blockKey, "buttonLink", val)}
            />
          </div>

          {/* Image */}
          <div className="pt-2">
            <ShopifyImagePicker
              label="Banner Image"
              value={blockData.image || ""}
              onChange={(url) => updateBlock(blockKey, "image", url)}
            />
          </div>
        </div>
      </Paper>
    );
  };

  return (
    <div className="space-y-6">
      {renderBlockEditor("block1", "Left Banner Block")}
      {renderBlockEditor("block2", "Right Banner Block")}
    </div>
  );
};
