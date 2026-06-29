import React, { useState } from "react";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import ShopifyVideoPicker from "@/components/ShopifyVideoPicker";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { IconButton, Button, Box, TextField, Select, MenuItem } from "@mui/material";
import StyledTextModal from "@/components/StyledTextModal";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import ResourcePicker from "@/components/admin/ResourcePicker";

interface AboutPlatformEditorProps {
  data: any;
  onChange: (data: any) => void;
  openResourcePicker?: (
    onSelect: (slug: string) => void,
    type: "product" | "collection" | "page"
  ) => void;
}

export const AboutPlatformEditor: React.FC<AboutPlatformEditorProps> = ({
  data,
  onChange,
  // openResourcePicker,
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

  const updateImageField = (field: string, value: string) => {
    onChange({
      ...data,
      images: {
        ...(data.images || {}),
        [field]: value,
      },
    });
  };

  const handleAddDescription = () => {
    const descriptions = data.descriptions || [];
    onChange({ ...data, descriptions: [...descriptions, ""] });
  };

  const handleUpdateDescription = (index: number, value: string) => {
    const descriptions = [...(data.descriptions || [])];
    descriptions[index] = value;
    onChange({ ...data, descriptions });
  };

  const handleRemoveDescription = (index: number) => {
    const descriptions = [...(data.descriptions || [])];
    descriptions.splice(index, 1);
    onChange({ ...data, descriptions });
  };

  const handleAddStatCard = () => {
    const statsCards = data.statsCards || [];
    onChange({
      ...data,
      statsCards: [
        ...statsCards,
        { value: "0", label: "Label", bgColor: "white" },
      ],
    });
  };

  const handleUpdateStatCard = (index: number, field: string, value: any) => {
    const statsCards = [...(data.statsCards || [])];
    statsCards[index] = { ...statsCards[index], [field]: value };
    onChange({ ...data, statsCards });
  };

  const handleRemoveStatCard = (index: number) => {
    const statsCards = [...(data.statsCards || [])];
    statsCards.splice(index, 1);
    onChange({ ...data, statsCards });
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
      <div className="grid grid-cols-1 gap-6">
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
        {/* ... (Subtitle remains unchanged conceptually, but we replace the block so it is fine) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Subtitle</label>
          <TextField
            size="small"
            fullWidth
            value={data.subtitle || ""}
            onChange={(e) => updateField("subtitle", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>

      {/* ... (Descriptions, Images, Stats Cards are skipped in replacement content to keep file size small, I will targeting specific blocks if possible or just the relevant parts) */}
      {/* Wait, I cannot skip middle parts in ReplaceContent. I should target smaller chunks. */}
      {/* Let's split into two replaces. */}

      {/* Descriptions */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">
            Descriptions
          </label>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddDescription}
          >
            Add Paragraph
          </Button>
        </div>
        <div className="space-y-2">
          {data.descriptions?.map((desc: string, index: number) => (
            <div key={index} className="flex gap-2">
              <TextField
                multiline
                rows={2}
                fullWidth
                size="small"
                value={desc}
                onChange={(e) => handleUpdateDescription(index, e.target.value)}
                sx={{ bgcolor: "white" }}
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveDescription(index)}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
        Images
      </h3>
      <div className="grid grid-cols-1 gap-6">
        <Box sx={{ width: "fit-content" }}>
          <ShopifyImagePicker
            label="Rounded Background Image"
            value={data.images?.roundedBg || ""}
            onChange={(url) => updateImageField("roundedBg", url)}
          />
        </Box>
        <Box sx={{ width: "fit-content" }}>
          <ShopifyImagePicker
            label="Meet Image"
            value={data.images?.meetImage || ""}
            onChange={(url) => updateImageField("meetImage", url)}
          />
        </Box>
        <div>
          <Box sx={{ width: "fit-content" }}>
            <ShopifyVideoPicker
              label="Platform Video"
              value={data.images?.video || ""}
              onChange={(url) => updateImageField("video", url)}
            />
          </Box>
        </div>
      </div>

      {/* Stats Cards */}
      <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 flex justify-between items-center">
        Stats Cards
      </h3>
      {/* ... existing stats cards code ... */}
      <div className="flex justify-between items-center mb-4">
        {/* Helper text or empty div for spacing if needed */}
        <div></div>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddStatCard}
        >
          Add Card
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {data.statsCards?.map((card: any, index: number) => (
          <div
            key={index}
            className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-slate-700">Card {index + 1}</h4>
              <IconButton
                color="error"
                size="small"
                onClick={() => handleRemoveStatCard(index)}
              >
                <DeleteIcon />
              </IconButton>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">
                  Value
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={card.value || ""}
                  onChange={(e) =>
                    handleUpdateStatCard(index, "value", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">
                  Label
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={card.label || ""}
                  onChange={(e) =>
                    handleUpdateStatCard(index, "label", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">
                  SubLabel (Optional)
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={card.sublabel || ""}
                  onChange={(e) =>
                    handleUpdateStatCard(index, "sublabel", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500">
                  Background Color
                </label>
                <Select
                  size="small"
                  fullWidth
                  value={card.bgColor || "white"}
                  onChange={(e) =>
                    handleUpdateStatCard(index, "bgColor", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                >
                  <MenuItem value="white">White</MenuItem>
                  <MenuItem value="yellow">Yellow</MenuItem>
                  <MenuItem value="blue">Blue</MenuItem>
                  <MenuItem value="image">Image Background</MenuItem>
                </Select>
              </div>
              {card.bgColor === "image" && (
                <div>
                  <Box sx={{ width: "fit-content" }}>
                    <ShopifyImagePicker
                      label="Background Image"
                      value={card.bgImage || ""}
                      onChange={(url) =>
                        handleUpdateStatCard(index, "bgImage", url)
                      }
                    />
                  </Box>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
        Action Button
      </h3>
      <div className="grid grid-cols-1 gap-6">
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
            Button Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.buttonBgColor || "#004DAA"}
              onChange={(e) => updateField("buttonBgColor", e.target.value)}
              className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
            />
            <TextField
              size="small"
              fullWidth
              value={data.buttonBgColor || "#004DAA"}
              onChange={(e) => updateField("buttonBgColor", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
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
            />
            <button
              onClick={() =>
                openResourcePicker(
                  (slug) => updateField("buttonLink", slug),
                  "page",
                  ["page", "product", "collection"],
                  "query"
                )
              }
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Pick Resource"
            >
              <SearchIcon fontSize="small" />
            </button>
          </div>
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
