import React, { useState } from "react";
import StyledTextModal from "@/components/StyledTextModal";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import { Button, TextField, Select, MenuItem } from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface BlogRecentEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const BlogRecentEditor: React.FC<BlogRecentEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
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
          value={data.title || "Our Recent Articles"}
          onChange={(e) => updateField("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Subtitle</label>
        <TextField
          size="small"
          fullWidth
          value={data.subtitle || "Stay Informed with Our Latest Insights"}
          onChange={(e) => updateField("subtitle", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
        <h3 className="text-sm font-semibold text-blue-800">
          Manual Product/Blog Selection (Optional)
        </h3>
        <p className="text-xs text-blue-600 mb-4">
          Override the automatically fetched blog posts with manual selections.
        </p>

        {[0, 1, 2].map((idx) => (
          <div key={idx} className="p-3 border rounded bg-white space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Post {idx + 1}</p>
            <ShopifyImagePicker
              label={`Post ${idx + 1} Image`}
              value={data.manualPosts?.[idx]?.image || ""}
              onChange={(url) => {
                const newPosts = [...(data.manualPosts || [{}, {}, {}])];
                newPosts[idx] = { ...newPosts[idx], image: url };
                updateField("manualPosts", newPosts);
              }}
            />
            <TextField
              size="small"
              fullWidth
              label="Title"
              value={data.manualPosts?.[idx]?.title || ""}
              onChange={(e) => {
                const newPosts = [...(data.manualPosts || [{}, {}, {}])];
                newPosts[idx] = { ...newPosts[idx], title: e.target.value };
                updateField("manualPosts", newPosts);
              }}
              placeholder="Post Title"
            />
            <TextField
              size="small"
              fullWidth
              label="Slug / Link"
              value={data.manualPosts?.[idx]?.slug || ""}
              onChange={(e) => {
                const newPosts = [...(data.manualPosts || [{}, {}, {}])];
                newPosts[idx] = { ...newPosts[idx], slug: e.target.value };
                updateField("manualPosts", newPosts);
              }}
              placeholder="e.g. my-awesome-post"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
