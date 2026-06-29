import React, { useState } from "react";
import {
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  Button,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  FormatPaint as FormatPaintIcon,
} from "@mui/icons-material";
import StyledTextModal from "@/components/StyledTextModal";
import ResourcePicker from "@/components/admin/ResourcePicker";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface TopBundlesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TopBundlesEditor: React.FC<TopBundlesEditorProps> = ({
  data,
  onChange,
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
    initialType: "collection", // Default to collection for brand
    allowedTypes: undefined,
    collectionLinkFormat: "plain",
  });

  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
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

      {/* Added Brand Slug field for Global usage */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Brand Slug (Optional)
        </label>
        <TextField
          size="small"
          fullWidth
          value={data.brandSlug || ""}
          onChange={(e) => updateData("brandSlug", e.target.value)}
          sx={{ bgcolor: "white" }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() =>
                    openResourcePicker(
                      (slug) => updateData("brandSlug", slug),
                      "collection",
                      ["collection"],
                      "plain"
                    )
                  }
                  edge="end"
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <p className="text-xs text-slate-500">
          Leave empty to use page context, or specify a brand slug to force a
          specific brand.
        </p>
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
    </Stack>
  );
};
