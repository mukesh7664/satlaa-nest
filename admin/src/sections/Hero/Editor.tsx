import React, { useState } from "react";
import ShopifyVideoPicker from "@/components/ShopifyVideoPicker";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import StyledTextModal from "@/components/StyledTextModal";
import LinkPicker from "@/components/admin/LinkPicker";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  IconButton,
  Stack,
  Paper,
  Typography,
  TextField,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface HeroEditorProps {
  data: any;
  onChange: (data: any) => void;
  // openResourcePicker?: (
  //   onSelect: (slug: string) => void,
  //   type: "product" | "collection" | "page"
  // ) => void;
  showAdvanced?: boolean;
  showTrustedBy?: boolean;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({
  data,
  onChange,
  // openResourcePicker,
  showAdvanced = false,
  showTrustedBy = false,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateCard = (index: number, field: string, value: any) => {
    const newCards = [...(data.statsCards || [])];
    if (!newCards[index]) newCards[index] = {};
    newCards[index] = { ...newCards[index], [field]: value };
    updateField("statsCards", newCards);
  };

  // --- Trusted By Logos Helpers ---
  const addTrustedLogo = () => {
    const logos = data.trustedByLogos || [];
    updateField("trustedByLogos", [
      ...logos,
      { src: "", alt: "Brand Logo", width: 100, height: 40 },
    ]);
  };

  const removeTrustedLogo = (index: number) => {
    const logos = [...(data.trustedByLogos || [])];
    logos.splice(index, 1);
    updateField("trustedByLogos", logos);
  };

  const updateTrustedLogo = (index: number, field: string, value: any) => {
    const logos = [...(data.trustedByLogos || [])];
    if (!logos[index]) logos[index] = {};
    logos[index] = { ...logos[index], [field]: value };
    updateField("trustedByLogos", logos);
  };

  const isUniversal = data.type === "GlobalHero" || data.type === "UniversalHero" || true; // Enabling for all as per user request to "fix" it
  const currentVariant = data.variant || (showAdvanced ? "hardware" : "standard");

  return (
    <div className="space-y-6">

      {/* Style Text Tool - Top */}
      <div>

        <Button
          size="small"
          variant="outlined"
          startIcon={<FormatPaintIcon />}
          onClick={() => setStyleModalOpen(true)}
          fullWidth
        >
          Style Text Tool
        </Button>
        <StyledTextModal
          open={styleModalOpen}
          onClose={() => setStyleModalOpen(false)}
        />
      </div>
      <div className="space-y-4">
        {/* Background Settings */}
        <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
          <Typography variant="subtitle2">Background Settings</Typography>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Type</label>
            <Select
              size="small"
              fullWidth
              value={data.bgType || "image"}
              onChange={(e) => updateField("bgType", e.target.value)}
              className="bg-white"
            >
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="color">Solid Color</MenuItem>
              <MenuItem value="gradient">Gradient</MenuItem>
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
              <p className="text-xs text-slate-500">
                Enter a valid CSS gradient value
              </p>
            </div>
          )}

          {(!data.bgType || data.bgType === "image") && (
            <ShopifyImagePicker
              label="Background Image"
              value={data.backgroundImage || ""}
              onChange={(url) => updateField("backgroundImage", url)}
            />
          )}

          <div className="pt-2 border-t mt-2">
            <ShopifyImagePicker
              label="Hero Image (Main Visual)"
              value={data.image || ""}
              onChange={(url) => {
                const newData = {
                  ...data,
                  image: url,
                  rightBannerImage: url, // Sync legacy field if needed
                };
                onChange(newData);
              }}
            />
          </div>
        </div>

      <div className="space-y-4">
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
          <label className="text-sm font-medium text-slate-700">Highlighted Text (Blue Color)</label>
          <TextField
            size="small"
            fullWidth
            value={data.highlightedText || ""}
            onChange={(e) => updateField("highlightedText", e.target.value)}
            placeholder="Text within title to highlight"
            sx={{ bgcolor: "white" }}
          />
        </div>

        {(currentVariant === "standard" || !showAdvanced) && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Pretitle / Subtitle
              </label>
              <TextField
                size="small"
                fullWidth
                value={data.subtitle || ""}
                onChange={(e) => updateField("subtitle", e.target.value)}
                placeholder="e.g. Click. Compare. Choose."
                sx={{ bgcolor: "white" }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Button Text
              </label>
              <TextField
                size="small"
                fullWidth
                value={data.buttonText || ""}
                onChange={(e) => updateField("buttonText", e.target.value)}
                placeholder="e.g. Get Started"
                sx={{ bgcolor: "white" }}
              />
            </div>
            <LinkPicker
              label="Button Link"
              value={data.buttonLink || ""}
              onChange={(value) => updateField("buttonLink", value)}
              placeholder="/contact-us"
              helperText="Select a page, product, or collection to link to"
              allowedTypes={["page", "product", "collection"]}
              collectionLinkFormat="query"
            />
            {/* Button Style */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Button Bg Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.buttonBgColor || "#4988FF"}
                    onChange={(e) =>
                      updateField("buttonBgColor", e.target.value)
                    }
                    className="h-9 w-9 shrink-0 p-0 border rounded cursor-pointer"
                  />
                  <TextField
                    size="small"
                    fullWidth
                    value={data.buttonBgColor || ""}
                    onChange={(e) =>
                      updateField("buttonBgColor", e.target.value)
                    }
                    placeholder="#4988FF"
                    sx={{ bgcolor: "white" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {!showAdvanced && showTrustedBy && (
          <div className="border-t pt-6 mt-6">
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Trusted By Section
            </Typography>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Trusted By Text
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={data.trustedByText || ""}
                  onChange={(e) => updateField("trustedByText", e.target.value)}
                  placeholder="Trusted by 185,000 companies"
                  sx={{ bgcolor: "white" }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Trusted By Logos
                  </label>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={addTrustedLogo}
                  >
                    Add Logo
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {(data.trustedByLogos || []).map(
                    (logo: any, index: number) => (
                      <div
                        key={index}
                        className="relative group bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col items-center gap-2"
                      >
                        <div className="w-full">
                          <ShopifyImagePicker
                            label={`Logo ${index + 1}`}
                            value={logo.src || ""}
                            onChange={(url) => {
                              if (url) {
                                updateTrustedLogo(index, "src", url);
                              } else {
                                removeTrustedLogo(index);
                              }
                            }}
                          />
                        </div>

                        <IconButton
                          size="small"
                          color="error"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm"
                          onClick={() => removeTrustedLogo(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Content / Description
          </label>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={data.content || data.description || ""}
            onChange={(e) => {
              onChange({
                ...data,
                content: e.target.value,
                description: e.target.value,
              });
            }}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </div>
    </div>



    </div>
  );
};
