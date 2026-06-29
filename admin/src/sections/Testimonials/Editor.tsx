import React, { useState } from "react";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FormatPaint as FormatPaintIcon,
} from "@mui/icons-material";
import StyledTextModal from "@/components/StyledTextModal";
import { Button, Box, TextField, IconButton, InputAdornment, Select, MenuItem } from "@mui/material";
import ResourcePicker from "@/components/admin/ResourcePicker";

interface TestimonialsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TestimonialsEditor: React.FC<TestimonialsEditorProps> = ({
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
    initialType: "product",
    allowedTypes: undefined,
    collectionLinkFormat: "plain",
  });

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addItem = () => {
    const currentItems = data.items || [];
    const newItems = [
      ...currentItems,
      { name: "", role: "", review: "", image: "", rating: 5 },
    ];
    updateField("items", newItems);
  };

  const removeItem = (index: number) => {
    const currentItems = data.items || [];
    const newItems = currentItems.filter((_: any, i: number) => i !== index);
    updateField("items", newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const currentItems = data.items || [];
    const newItems = currentItems.map((item: any, i: number) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateField("items", newItems);
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
        <label className="text-sm font-medium text-slate-700">Subtitle</label>
        <TextField
          size="small"
          fullWidth
          value={data.subtitle || ""}
          onChange={(e) => updateField("subtitle", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Items</h3>
        {(data.items || []).map((item: any, index: number) => (
          <div
            key={index}
            className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4 relative"
          >
            <button
              onClick={() => removeItem(index)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <DeleteIcon fontSize="small" />
            </button>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Name
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={item.name || ""}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Role
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={item.role || ""}
                  onChange={(e) => updateItem(index, "role", e.target.value)}
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Review
                </label>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={item.review || ""}
                  onChange={(e) => updateItem(index, "review", e.target.value)}
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Image Shape
                </label>
                <Select
                  size="small"
                  fullWidth
                  value={item.imageShape || "circle"}
                  onChange={(e) =>
                    updateItem(index, "imageShape", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                >
                  <MenuItem value="circle">Circle</MenuItem>
                  <MenuItem value="square">Square</MenuItem>
                </Select>
              </div>
              <div className="w-24 space-y-1">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700">
                    Profile Image
                  </span>
                  <span className="text-[10px] text-slate-500">Ratio: 1:1</span>
                </div>
                <ShopifyImagePicker
                  label="Profile Image"
                  value={item.image || ""}
                  onChange={(url) => updateItem(index, "image", url)}
                  aspectRatio="1/1"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Rating (1-5)
                </label>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  inputProps={{ min: 1, max: 5 }}
                  value={item.rating || 5}
                  onChange={(e) =>
                    updateItem(index, "rating", parseInt(e.target.value))
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addItem}
          className="text-sm text-[#408dfb] hover:text-indigo-700 font-medium inline-flex items-center gap-1"
        >
          <AddIcon fontSize="small" />
          Add Item
        </button>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800">
          Stats Cards (5 Cards Layout)
        </h3>
        <p className="text-xs text-slate-500">
          The layout expects 5 cards. 1st is the large left card, next 4 are the
          right grid cards.
        </p>
        {(data.stats || []).map((stat: any, index: number) => (
          <div
            key={index}
            className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4 relative"
          >
            <button
              onClick={() => {
                const currentStats = data.stats || [];
                const newStats = currentStats.filter(
                  (_: any, i: number) => i !== index
                );
                updateField("stats", newStats);
              }}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <DeleteIcon fontSize="small" />
            </button>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Card {index + 1} {index === 0 ? "(Large Left)" : "(Grid Item)"}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Title & Count */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Title
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={stat.title || ""}
                  onChange={(e) => {
                    const currentStats = data.stats || [];
                    const newStats = currentStats.map((item: any, i: number) =>
                      i === index ? { ...item, title: e.target.value } : item
                    );
                    updateField("stats", newStats);
                  }}
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <div className="space-y-1.5 ">
                <label className="text-sm font-medium text-slate-700">
                  Count Value (e.g. 500+)
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={(stat.count || "") + (stat.suffix || "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    const match = val.match(/^(\d*)(.*)$/);
                    const newCount = match ? parseInt(match[1] || "0") : 0;
                    const newSuffix = match ? match[2] : "";

                    const currentStats = data.stats || [];
                    const newStats = currentStats.map((item: any, i: number) =>
                      i === index
                        ? { ...item, count: newCount, suffix: newSuffix }
                        : item
                    );
                    updateField("stats", newStats);
                  }}
                  sx={{ bgcolor: "white" }}
                />
              </div>

              {/* Image Shape Selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Image Shape
                </label>
                <Select
                  size="small"
                  fullWidth
                  value={stat.imageShape || "circle"}
                  onChange={(e) => {
                    const currentStats = data.stats || [];
                    const newStats = currentStats.map((item: any, i: number) =>
                      i === index
                        ? { ...item, imageShape: e.target.value }
                        : item
                    );
                    updateField("stats", newStats);
                  }}
                  sx={{ bgcolor: "white" }}
                >
                  <MenuItem value="circle">Circle</MenuItem>
                  <MenuItem value="square">Square</MenuItem>
                </Select>
              </div>

              {/* Images */}
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-700">
                  Background Image
                </span>
                <ShopifyImagePicker
                  label="Background Image"
                  value={stat.backgroundImage || ""}
                  onChange={(url) => {
                    const currentStats = data.stats || [];
                    const newStats = currentStats.map((item: any, i: number) =>
                      i === index ? { ...item, backgroundImage: url } : item
                    );
                    updateField("stats", newStats);
                  }}
                />
              </div>
              <div className="space-y-4">
                <span className="text-sm font-medium text-slate-700">
                  Inner Image / Icons (Multiple)
                </span>
                <div className="flex flex-wrap gap-4">
                  {(
                    stat.innerImages ||
                    (stat.innerImage ? [stat.innerImage] : [])
                  ).map((img: string, imgIndex: number) => (
                    <div key={imgIndex} className="relative w-28">
                      <ShopifyImagePicker
                        label="Icon"
                        value={img}
                        aspectRatio="1/1"
                        onChange={(url) => {
                          const currentStats = data.stats || [];
                          const newStats = currentStats.map(
                            (item: any, i: number) => {
                              if (i !== index) return item;

                              // If URL is empty (removed via ImageUploader), remove the item from array
                              if (!url) {
                                const newInnerImages = (
                                  item.innerImages ||
                                  (item.innerImage ? [item.innerImage] : [])
                                ).filter(
                                  (_: any, idx: number) => idx !== imgIndex
                                );
                                return {
                                  ...item,
                                  innerImages: newInnerImages,
                                  innerImage: newInnerImages[0] || "",
                                };
                              }

                              // Otherwise update the URL
                              const newInnerImages = [
                                ...(item.innerImages ||
                                  (item.innerImage ? [item.innerImage] : [])),
                              ];
                              newInnerImages[imgIndex] = url;
                              return {
                                ...item,
                                innerImages: newInnerImages,
                                innerImage: newInnerImages[0],
                              };
                            }
                          );
                          updateField("stats", newStats);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const currentStats = data.stats || [];
                      const newStats = currentStats.map(
                        (item: any, i: number) => {
                          if (i !== index) return item;
                          const newInnerImages = [
                            ...(item.innerImages ||
                              (item.innerImage ? [item.innerImage] : [])),
                            "",
                          ];
                          return { ...item, innerImages: newInnerImages };
                        }
                      );
                      updateField("stats", newStats);
                    }}
                    className="w-28 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col gap-2 items-center justify-center text-slate-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors bg-slate-50"
                    title="Add Icon"
                  >
                    <AddIcon fontSize="large" />
                    <span className="text-xs font-medium">Add Icon</span>
                  </button>
                </div>
              </div>

              {/* Button */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Button Text
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={stat.buttonText || ""}
                  onChange={(e) => {
                    const currentStats = data.stats || [];
                    const newStats = currentStats.map((item: any, i: number) =>
                      i === index
                        ? { ...item, buttonText: e.target.value }
                        : item
                    );
                    updateField("stats", newStats);
                  }}
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
                    value={stat.buttonLink || ""}
                    onChange={(e) => {
                      const currentStats = data.stats || [];
                      const newStats = currentStats.map(
                        (item: any, i: number) =>
                          i === index
                            ? { ...item, buttonLink: e.target.value }
                            : item
                      );
                      updateField("stats", newStats);
                    }}
                    sx={{ bgcolor: "white" }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() =>
                              openResourcePicker(
                                (slug) => {
                                  const currentStats = data.stats || [];
                                  const newStats = currentStats.map(
                                    (item: any, i: number) =>
                                      i === index
                                        ? { ...item, buttonLink: slug }
                                        : item
                                  );
                                  updateField("stats", newStats);
                                },
                                "page",
                                ["page", "product", "collection"],
                                "query"
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
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Background Color (Hex)
                </label>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="#FFC6C6"
                  value={stat.backgroundColor || ""}
                  onChange={(e) => {
                    const currentStats = data.stats || [];
                    const newStats = currentStats.map((item: any, i: number) =>
                      i === index
                        ? { ...item, backgroundColor: e.target.value }
                        : item
                    );
                    updateField("stats", newStats);
                  }}
                  sx={{ bgcolor: "white" }}
                />
              </div>
            </div>
          </div>
        ))}

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

        <button
          onClick={() => {
            const currentStats = data.stats || [];
            const newStats = [
              ...currentStats,
              {
                title: "",
                count: 0,
                suffix: "",
                backgroundImage: "",
                innerImage: "",
                buttonText: "",
                buttonLink: "",
                backgroundColor: "",
              },
            ];
            updateField("stats", newStats);
          }}
          className="text-sm text-[#408dfb] hover:text-indigo-700 font-medium inline-flex items-center gap-1"
        >
          <AddIcon fontSize="small" />
          Add Stat Card
        </button>
      </div>
    </div>
  );
};
