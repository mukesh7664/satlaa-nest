import React, { useState } from "react";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import StyledTextModal from "@/components/StyledTextModal";
import { Button, TextField, Select, MenuItem } from "@mui/material";
import LinkPicker from "@/components/admin/LinkPicker";

interface DualBannerEditorProps {
  data: any;
  onChange: (data: any) => void;
  openResourcePicker?: (
    onSelect: (slug: string) => void,
    type: "product" | "collection" | "page"
  ) => void;
}

export const DualBannerEditor: React.FC<DualBannerEditorProps> = ({
  data,
  onChange,
  // openResourcePicker,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);

  const updateBanner = (
    banner: "banner1" | "banner2",
    field: string,
    value: any
  ) => {
    onChange({
      ...data,
      [banner]: {
        ...data?.[banner],
        [field]: value,
      },
    });
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
            // Let's use onChange directly for root props.
            onChange={(e) => onChange({ ...data, bgType: e.target.value })}
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
                onChange={(e) => onChange({ ...data, bgColor: e.target.value })}
                className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
              />
              <TextField
                size="small"
                fullWidth
                value={data.bgColor || "#ffffff"}
                onChange={(e) => onChange({ ...data, bgColor: e.target.value })}
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
              onChange={(e) =>
                onChange({ ...data, bgGradient: e.target.value })
              }
              placeholder="linear-gradient(to right, #ff0000, #0000ff)"
              sx={{ bgcolor: "white" }}
            />
          </div>
        )}

        {data.bgType === "image" && (
          <ShopifyImagePicker
            label="Background Image"
            value={data.backgroundImage || ""}
            onChange={(url) => onChange({ ...data, backgroundImage: url })}
          />
        )}
      </div>
      {/* Banner 1 */}
      <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800">Left Banner</h3>
        <ShopifyImagePicker
          label="Image"
          value={data?.banner1?.image || ""}
          onChange={(url) => updateBanner("banner1", "image", url)}
        />
        <LinkPicker
          label="Link"
          value={data?.banner1?.link || ""}
          onChange={(value) => updateBanner("banner1", "link", value)}
          placeholder="/products"
          helperText="Select a page, product, or collection to link to"
          allowedTypes={["page", "product", "collection"]}
          collectionLinkFormat="query"
        />
      </div>

      {/* Banner 2 */}
      <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800">Right Banner</h3>
        <ShopifyImagePicker
          label="Image"
          value={data?.banner2?.image || ""}
          onChange={(url) => updateBanner("banner2", "image", url)}
        />
        <LinkPicker
          label="Link"
          value={data?.banner2?.link || ""}
          onChange={(value) => updateBanner("banner2", "link", value)}
          placeholder="/products"
          helperText="Select a page, product, or collection to link to"
          allowedTypes={["page", "product", "collection"]}
          collectionLinkFormat="query"
        />
      </div>
    </div>
  );
};
