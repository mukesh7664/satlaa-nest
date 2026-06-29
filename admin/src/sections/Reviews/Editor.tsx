import React, { useState } from "react";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  FormatPaint as FormatPaintIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Button,
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import StyledTextModal from "@/components/StyledTextModal";
import ResourcePicker from "@/components/admin/ResourcePicker";

interface ReviewsEditorProps {
  data: any;
  onChange: (data: any) => void;
  openResourcePicker?: (
    onSelect: (slug: string) => void,
    type: "product" | "collection" | "page"
  ) => void;
  isHomepage?: boolean;
  hideButtonOptions?: boolean;
}

export const ReviewsEditor: React.FC<ReviewsEditorProps> = ({
  data,
  onChange,
  isHomepage = false,
  hideButtonOptions = false,
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

  // --- Visibility Logic ---
  const hasButtonData = !!data.buttonText || !!data.buttonLink;
  const hasDetailedData =
    (data.ratingCategories && data.ratingCategories.length > 0) ||
    (data.testimonials && data.testimonials.length > 0) ||
    (data.companyLogos && data.companyLogos.length > 0);

  // Show Button: Visible unless we have committed to Detailed Stats OR we are explicitly hiding it
  const showButton = !hideButtonOptions && !hasDetailedData;

  // Show Detailed Stats: Visible unless we have committed to Button (Simple Mode)
  const showDetailedStats = !hasButtonData;

  // --- Rating Categories Helpers ---
  const addRatingCategory = () => {
    const categories = data.ratingCategories || [];
    updateField("ratingCategories", [
      ...categories,
      { label: "New Category", rating: 4.5, count: "1K" },
    ]);
  };

  const removeRatingCategory = (index: number) => {
    const categories = [...(data.ratingCategories || [])];
    categories.splice(index, 1);
    updateField("ratingCategories", categories);
  };

  const updateRatingCategory = (index: number, field: string, value: any) => {
    const categories = [...(data.ratingCategories || [])];
    categories[index] = { ...categories[index], [field]: value };
    updateField("ratingCategories", categories);
  };

  // --- Testimonials Helpers ---
  const addTestimonial = () => {
    const testimonials = data.testimonials || [];
    updateField("testimonials", [
      ...testimonials,
      {
        text: "Great product!",
        authorName: "John Doe",
        authorRole: "Manager",
        rating: 5,
        authorAvatar: "",
      },
    ]);
  };

  const removeTestimonial = (index: number) => {
    const testimonials = [...(data.testimonials || [])];
    testimonials.splice(index, 1);
    updateField("testimonials", testimonials);
  };

  const updateTestimonial = (index: number, field: string, value: any) => {
    const testimonials = [...(data.testimonials || [])];
    testimonials[index] = { ...testimonials[index], [field]: value };
    updateField("testimonials", testimonials);
  };

  // --- Company Logos Helpers ---
  const addLogo = () => {
    const logos = data.companyLogos || [];
    updateField("companyLogos", [
      ...logos,
      { src: "", alt: "Logo", width: 100, height: 40 },
    ]);
  };

  const removeLogo = (index: number) => {
    const logos = [...(data.companyLogos || [])];
    logos.splice(index, 1);
    updateField("companyLogos", logos);
  };

  const updateLogo = (index: number, field: string, value: any) => {
    const logos = [...(data.companyLogos || [])];
    logos[index] = { ...logos[index], [field]: value };
    updateField("companyLogos", logos);
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

        <div className="space-y-1.5">
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

        {/* Button Options - Auto Visible */}
        {showButton && (
          <>
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
          </>
        )}

        <div className="max-w-xs space-y-1">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">
              Main Image
            </span>
          </div>
          <ShopifyImagePicker
            label="Main Image"
            value={data.image || ""}
            onChange={(url) => updateField("image", url)}
          />
        </div>
      </div>

      {showDetailedStats && (
        <>
          {/* Rating Categories */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Rating Categories
              </h3>
              <button
                onClick={addRatingCategory}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <AddIcon fontSize="small" />
                Add Category
              </button>
            </div>
            <div className="grid gap-3">
              {(data.ratingCategories || []).map((cat: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex-1 grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">
                        Category Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ease of Use"
                        value={cat.label || ""}
                        onChange={(e) =>
                          updateRatingCategory(index, "label", e.target.value)
                        }
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">
                        Rating (0-5)
                      </label>
                      <input
                        type="number"
                        placeholder="4.5"
                        step="0.1"
                        max="5"
                        value={cat.rating || ""}
                        onChange={(e) =>
                          updateRatingCategory(
                            index,
                            "rating",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">
                        Count
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2.5K"
                        value={cat.count || ""}
                        onChange={(e) =>
                          updateRatingCategory(index, "count", e.target.value)
                        }
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeRatingCategory(index)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Testimonials
              </h3>
              <button
                onClick={addTestimonial}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <AddIcon fontSize="small" />
                Add Testimonial
              </button>
            </div>
            <div className="space-y-2">
              {(data.testimonials || []).map((review: any, index: number) => (
                <Accordion
                  key={index}
                  disableGutters
                  className="border border-slate-200 rounded-lg overflow-hidden shadow-sm before:hidden"
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-medium text-slate-700 text-sm">
                        {review.authorName || `Testimonial ${index + 1}`}
                      </span>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTestimonial(index);
                        }}
                        sx={{
                          color: "text.secondary",
                          "&:hover": { color: "error.main" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails className="bg-slate-50 border-t border-slate-100 p-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">
                          Author Name
                        </label>
                        <TextField
                          size="small"
                          fullWidth
                          value={review.authorName || ""}
                          onChange={(e) =>
                            updateTestimonial(
                              index,
                              "authorName",
                              e.target.value
                            )
                          }
                          sx={{ bgcolor: "white" }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">
                          Role
                        </label>
                        <TextField
                          size="small"
                          fullWidth
                          value={review.authorRole || ""}
                          onChange={(e) =>
                            updateTestimonial(
                              index,
                              "authorRole",
                              e.target.value
                            )
                          }
                          sx={{ bgcolor: "white" }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">
                          Rating
                        </label>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ step: "0.5", max: "5" }}
                          value={review.rating || 5}
                          onChange={(e) =>
                            updateTestimonial(
                              index,
                              "rating",
                              parseFloat(e.target.value)
                            )
                          }
                          sx={{ bgcolor: "white" }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">
                          Review Text
                        </label>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={review.text || ""}
                          onChange={(e) =>
                            updateTestimonial(index, "text", e.target.value)
                          }
                          sx={{ bgcolor: "white" }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">
                          Author Avatar
                        </label>
                        <div className="w-20">
                          <ShopifyImagePicker
                            label="Avatar"
                            value={review.authorAvatar || ""}
                            onChange={(url) =>
                              updateTestimonial(index, "authorAvatar", url)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          </div>

          {/* Company Logos */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Trusted Brand Logos
              </h3>
            </div>
            {/* Added Trusted Brands Title & Description */}
            <div className="space-y-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Trusted Brands Title
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={data.trustedBrandsTitle || ""}
                  onChange={(e) =>
                    updateField("trustedBrandsTitle", e.target.value)
                  }
                  placeholder="e.g. The best brands trust us"
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Trusted Brands Description
                </label>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={data.trustedBrandsDescription || ""}
                  onChange={(e) =>
                    updateField("trustedBrandsDescription", e.target.value)
                  }
                  placeholder="e.g. Trusted by 185,000 companies"
                  sx={{ bgcolor: "white" }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Logos</h3>
              <button
                onClick={addLogo}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <AddIcon fontSize="small" />
                Add Logo
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {(data.companyLogos || []).map((logo: any, index: number) => (
                <div
                  key={index}
                  className="relative group bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col items-center gap-2"
                >
                  <div className="w-full">
                    <ShopifyImagePicker
                      label="Logo"
                      value={logo.src || ""}
                      onChange={(url) => {
                        if (url) {
                          updateLogo(index, "src", url);
                        } else {
                          removeLogo(index);
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

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
