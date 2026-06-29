import React, { useState } from "react";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import {
  Search as SearchIcon,
  FormatPaint as FormatPaintIcon,
} from "@mui/icons-material";
import { Button, Box, TextField, IconButton } from "@mui/material";
import StyledTextModal from "@/components/StyledTextModal";
import ResourcePicker from "@/components/admin/ResourcePicker";

interface SimpleReviewsEditorProps {
  data: any;
  onChange: (data: any) => void;
  openResourcePicker?: (
    onSelect: (slug: string) => void,
    type: "product" | "collection" | "page"
  ) => void;
  isHomepage?: boolean;
}

export const SimpleReviewsEditor: React.FC<SimpleReviewsEditorProps> = ({
  data,
  onChange,
  isHomepage = false,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [pickerState, setPickerState] = useState<{
    isOpen: boolean;
    onSelect: ((slug: string) => void) | null;
    initialType: "product" | "collection" | "page";
    allowedTypes?: ("product" | "collection" | "page")[];
    collectionLinkFormat?: "plain" | "query";
  }>({
    isOpen: false,
    onSelect: null,
    initialType: "product",
    allowedTypes: undefined,
    collectionLinkFormat: "plain",
  });

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const openResourcePicker = (
    onSelect: (slug: string) => void,
    initialType: "product" | "collection" | "page",
    allowedTypes?: ("product" | "collection" | "page")[],
    collectionLinkFormat: "plain" | "query" = "plain"
  ) => {
    setPickerState({
      isOpen: true,
      onSelect,
      initialType,
      allowedTypes,
      collectionLinkFormat,
    });
  };

  return (
    <div className="space-y-8">
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

      {/* General Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5 col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Title</label>
          <TextField
            size="small"
            fullWidth
            value={data.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5 col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">
            Highlighted Text
          </label>
          <TextField
            size="small"
            fullWidth
            value={data.highlightedText || ""}
            onChange={(e) => updateField("highlightedText", e.target.value)}
            placeholder="Text to highlight in title"
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5 col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">
            Description
          </label>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={data.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>

        {/* Button Options - ALWAYS Visible in Simple Editor */}
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
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Button Link
          </label>
          <div className="flex gap-2">
            <TextField
              size="small"
              fullWidth
              value={data.buttonLink || ""}
              onChange={(e) => updateField("buttonLink", e.target.value)}
              sx={{ bgcolor: "white" }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() =>
                      openResourcePicker(
                        (slug) => updateField("buttonLink", slug),
                        "page",
                        ["page", "product", "collection"],
                        "query"
                      )
                    }
                    edge="end"
                    size="small"
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 max-w-xs space-y-1">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">
              Main Image
            </span>
            <span className="text-[10px] text-slate-500">Ratio: 1.2:1</span>
          </div>
          <ShopifyImagePicker
            label="Main Image"
            value={data.image || ""}
            onChange={(url) => updateField("image", url)}
          />
        </div>
      </div>

      <ResourcePicker
        isOpen={pickerState.isOpen}
        onClose={() => setPickerState((prev) => ({ ...prev, isOpen: false }))}
        onSelect={(slug) => {
          if (pickerState.onSelect) {
            pickerState.onSelect(slug);
          }
        }}
        initialType={pickerState.initialType}
        allowedTypes={pickerState.allowedTypes}
        collectionLinkFormat={pickerState.collectionLinkFormat}
      />
    </div>
  );
};
