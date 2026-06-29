"use client";

import React, { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Typography,
  Button,
  IconButton,
  Paper,
  Divider,
  Grid,
  FormControlLabel,
  Switch,
  Card,
  Rating,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import Image from "next/image";
import MediaPickerModal from "@/components/MediaPickerModal";

const GridItem = Grid as any;

interface ProductDetailsStepProps {
  formData: any;
  setFormData: (data: any) => void;
  bannerImageFile: File | null;
  setBannerImageFile: (file: File | null) => void;
}

export default function ProductDetailsStep({
  formData,
  setFormData,
  bannerImageFile,
  setBannerImageFile,
}: ProductDetailsStepProps) {
  const isBundle = formData.productStructureType === "bundle";
  const [activeTab, setActiveTab] = useState(isBundle ? "bundleOverview" : "overview");
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData };
    const fields = field.split(".");
    let current: any = newData;
    for (let i = 0; i < fields.length - 1; i++) {
      if (!current[fields[i]]) {
        current[fields[i]] = {};
      }
      current = current[fields[i]];
    }
    current[fields[fields.length - 1]] = value;
    setFormData(newData);
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  // FAQ Management
  const addFAQ = () => {
    const faqs = [...(formData.productDetails?.faq?.questions || [])];
    faqs.push({ question: "", answer: "" });
    handleChange("productDetails.faq.questions", faqs);
  };

  const removeFAQ = (index: number) => {
    const faqs = [...(formData.productDetails?.faq?.questions || [])];
    faqs.splice(index, 1);
    handleChange("productDetails.faq.questions", faqs);
  };

  // Feature Points Management
  const addFeaturePoint = () => {
    const points = [...(formData.productDetails?.features?.featurePoints || [])];
    points.push({ title: "", content: "" });
    handleChange("productDetails.features.featurePoints", points);
  };

  const removeFeaturePoint = (index: number) => {
    const points = [...(formData.productDetails?.features?.featurePoints || [])];
    points.splice(index, 1);
    handleChange("productDetails.features.featurePoints", points);
  };

  // Features Checklist Management
  const addChecklistItem = () => {
    const checklist = [...(formData.productDetails?.features?.checklist || [])];
    checklist.push("");
    handleChange("productDetails.features.checklist", checklist);
  };

  const removeChecklistItem = (index: number) => {
    const checklist = [...(formData.productDetails?.features?.checklist || [])];
    checklist.splice(index, 1);
    handleChange("productDetails.features.checklist", checklist);
  };

  // Product Points Management
  const addProductPoint = () => {
    const points = [...(formData.productDetails?.productPoints?.points || [])];
    points.push("");
    handleChange("productDetails.productPoints.points", points);
  };

  const removeProductPoint = (index: number) => {
    const points = [...(formData.productDetails?.productPoints?.points || [])];
    points.splice(index, 1);
    handleChange("productDetails.productPoints.points", points);
  };

  // Why Choose Points Management
  const addWhyChoosePoint = () => {
    const points = [...(formData.productDetails?.whyChoose?.points || [])];
    points.push({ title: "", content: "" });
    handleChange("productDetails.whyChoose.points", points);
  };

  const removeWhyChoosePoint = (index: number) => {
    const points = [...(formData.productDetails?.whyChoose?.points || [])];
    points.splice(index, 1);
    handleChange("productDetails.whyChoose.points", points);
  };

  // Specifications Management
  const addSpecification = () => {
    const specs = [...(formData.productDetails?.specifications?.items || [])];
    specs.push({ title: "", value: "" });
    handleChange("productDetails.specifications.items", specs);
  };

  const removeSpecification = (index: number) => {
    const specs = [...(formData.productDetails?.specifications?.items || [])];
    specs.splice(index, 1);
    handleChange("productDetails.specifications.items", specs);
  };

  // Reviews Management
  const addUserReview = () => {
    const userReviews = [...(formData.productDetails?.reviews?.userReviews || [])];
    userReviews.push({
      avatar: "",
      name: "",
      rating: 5,
      date: "",
      comment: "",
    });
    handleChange("productDetails.reviews.userReviews", userReviews);
  };

  const removeUserReview = (index: number) => {
    const userReviews = [...(formData.productDetails?.reviews?.userReviews || [])];
    userReviews.splice(index, 1);
    handleChange("productDetails.reviews.userReviews", userReviews);
  };

  // Define All Available Form Tabs
  const allTabs = [
    // Bundle-Specific
    { id: "bundleOverview", label: "Bundle Overview", enabledPath: "productDetails.bundleOverview.enabled", isBundleOnly: true },
    { id: "bundleFeatures", label: "Bundle Features", enabledPath: "productDetails.bundleFeatures.enabled", isBundleOnly: true },
    // General
    { id: "overview", label: "Overview", enabledPath: "productDetails.overview.enabled" },
    { id: "specifications", label: "Specifications", enabledPath: "productDetails.specifications.enabled" },
    { id: "faq", label: "FAQs", enabledPath: "productDetails.faq.enabled" },
    { id: "features", label: "Features & Checklist", enabledPath: "productDetails.features.enabled" },
    { id: "whyChoose", label: "Why Choose Us", enabledPath: "productDetails.whyChoose.enabled" },
    { id: "productPoints", label: "Product Points", enabledPath: "productDetails.productPoints.enabled" },
    { id: "banner", label: "Banner Image", enabledPath: null },
  ];

  const activeTabs = allTabs.filter(tab => !tab.isBundleOnly || isBundle);

  // Common Header Helper
  const renderSectionHeader = (title: string, description: string, enabledPath: string | null) => {
    const isEnabled = enabledPath ? getNestedValue(formData, enabledPath) !== false : true;
    return (
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
            {title}
          </Typography>
          {enabledPath && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={isEnabled}
                  onChange={(e) => handleChange(enabledPath, e.target.checked)}
                />
              }
              label={
                <Typography variant="caption" fontWeight="bold" sx={{ color: isEnabled ? "#2563eb" : "text.secondary" }}>
                  {isEnabled ? "Enabled" : "Disabled"}
                </Typography>
              }
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.2 }}>
          {description}
        </Typography>
        <Divider sx={{ my: 1.5 }} />
      </Box>
    );
  };

  // Disabled Notice Helper
  const isSectionDisabled = (enabledPath: string | null) => {
    if (!enabledPath) return false;
    return getNestedValue(formData, enabledPath) === false;
  };

  const renderDisabledNotice = (sectionName: string, enabledPath: string) => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          px: 3,
          textAlign: "center",
          bgcolor: "#f8fafc",
          borderRadius: 3,
          border: "1px dashed #e2e8f0",
        }}
      >
        <Typography variant="body1" fontWeight="bold" color="text.secondary" gutterBottom>
          {sectionName} Section is Disabled
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 380, mb: 2 }}>
          Enable this section to configure custom settings and information that will display on your product detail page.
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => handleChange(enabledPath, true)}
          sx={{
            backgroundColor: "#2563eb",
            "&:hover": { backgroundColor: "#1d4ed8" },
            textTransform: "none",
            borderRadius: 2,
            boxShadow: "none",
            fontSize: "0.75rem",
          }}
        >
          Enable Section
        </Button>
      </Box>
    );
  };

  // Content Renderer for Active Tab
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "bundleOverview":
        if (isSectionDisabled("productDetails.bundleOverview.enabled")) {
          return renderDisabledNotice("Bundle Overview", "productDetails.bundleOverview.enabled");
        }
        return (
          <Box>
            {renderSectionHeader("Bundle Overview", "Provide an introductory overview for the product bundle.", "productDetails.bundleOverview.enabled")}
            <Stack spacing={2}>
              <TextField
                label="Bundle Section Title"
                size="small"
                value={formData.productDetails?.bundleOverview?.title || ""}
                onChange={(e) => handleChange("productDetails.bundleOverview.title", e.target.value)}
                fullWidth
                placeholder="Bundle Overview"
              />
              <TextField
                label="Bundle Description"
                size="small"
                value={formData.productDetails?.bundleOverview?.content || ""}
                onChange={(e) => handleChange("productDetails.bundleOverview.content", e.target.value)}
                fullWidth
                multiline
                rows={4}
                placeholder="Describe what this bundle offers..."
              />
            </Stack>
          </Box>
        );

      case "bundleFeatures":
        if (isSectionDisabled("productDetails.bundleFeatures.enabled")) {
          return renderDisabledNotice("Bundle Features & Benefits", "productDetails.bundleFeatures.enabled");
        }
        return (
          <Box>
            {renderSectionHeader("Bundle Features & Benefits", "Detail the primary benefits and features included in this bundle pack.", "productDetails.bundleFeatures.enabled")}
            <Stack spacing={2}>
              <TextField
                label="Section Custom Title"
                size="small"
                value={formData.productDetails?.bundleFeatures?.title || ""}
                onChange={(e) => handleChange("productDetails.bundleFeatures.title", e.target.value)}
                fullWidth
                placeholder="Bundle Features"
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  Key Benefits ({(formData.productDetails?.bundleFeatures?.points || []).length})
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const points = [...(formData.productDetails?.bundleFeatures?.points || []), ""];
                    handleChange("productDetails.bundleFeatures.points", points);
                  }}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 1.5 }}
                >
                  Add Benefit
                </Button>
              </Box>

              {(formData.productDetails?.bundleFeatures?.points || []).map((point: string, index: number) => (
                <Box key={index} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <TextField
                    label={`Benefit ${index + 1}`}
                    size="small"
                    value={point || ""}
                    onChange={(e) => {
                      const points = [...(formData.productDetails?.bundleFeatures?.points || [])];
                      points[index] = e.target.value;
                      handleChange("productDetails.bundleFeatures.points", points);
                    }}
                    fullWidth
                  />
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => {
                      const points = [...(formData.productDetails?.bundleFeatures?.points || [])];
                      points.splice(index, 1);
                      handleChange("productDetails.bundleFeatures.points", points);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        );

      case "overview":
        if (isSectionDisabled("productDetails.overview.enabled")) {
          return renderDisabledNotice("Overview", "productDetails.overview.enabled");
        }
        return (
          <Box>
            {renderSectionHeader("Overview", "Provide a detailed overview section describing this product's purpose and general details.", "productDetails.overview.enabled")}
            <Stack spacing={2}>
              <TextField
                label="Section Custom Title"
                size="small"
                value={formData.productDetails?.overview?.title || ""}
                onChange={(e) => handleChange("productDetails.overview.title", e.target.value)}
                fullWidth
                placeholder="Overview"
              />
              <TextField
                label="Overview Content"
                size="small"
                value={formData.productDetails?.overview?.content || ""}
                onChange={(e) => handleChange("productDetails.overview.content", e.target.value)}
                fullWidth
                multiline
                rows={6}
                placeholder="Enter a comprehensive overview description for customers..."
              />
            </Stack>
          </Box>
        );

      case "whyChoose":
        if (isSectionDisabled("productDetails.whyChoose.enabled")) {
          return renderDisabledNotice("Why Choose Us", "productDetails.whyChoose.enabled");
        }
        return (
          <Box>
            {renderSectionHeader("Why Choose Us", "Add points illustrating key reasons to purchase this product.", "productDetails.whyChoose.enabled")}
            <Stack spacing={2}>
              <TextField
                label="Section Custom Title"
                size="small"
                value={formData.productDetails?.whyChoose?.title || ""}
                onChange={(e) => handleChange("productDetails.whyChoose.title", e.target.value)}
                fullWidth
                placeholder="Why Choose Us"
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  Reasons List ({(formData.productDetails?.whyChoose?.points || []).length})
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addWhyChoosePoint}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 1.5 }}
                >
                  Add Point
                </Button>
              </Box>

              {(formData.productDetails?.whyChoose?.points || []).map((point: any, index: number) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "#f8fafc",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "start" }}>
                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      <TextField
                        label="Point Title"
                        value={point.title || ""}
                        onChange={(e) => {
                          const points = [...(formData.productDetails?.whyChoose?.points || [])];
                          points[index].title = e.target.value;
                          handleChange("productDetails.whyChoose.points", points);
                        }}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Point Description"
                        value={point.content || ""}
                        onChange={(e) => {
                          const points = [...(formData.productDetails?.whyChoose?.points || [])];
                          points[index].content = e.target.value;
                          handleChange("productDetails.whyChoose.points", points);
                        }}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                      />
                    </Stack>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => removeWhyChoosePoint(index)}
                      sx={{ mt: 0.5 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        );

      case "banner":
        return (
          <Box>
            {renderSectionHeader("Banner Image", "Set a secondary high-impact showcase banner with headers for the product page details.", null)}
            <Stack spacing={2.5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: "2px dashed",
                  borderColor: "divider",
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 3,
                  transition: "all 0.2s",
                  backgroundColor: "rgba(240, 244, 255, 0.2)",
                  "&:hover": {
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(240, 244, 255, 0.5)",
                  },
                }}
                onClick={() => setBannerPickerOpen(true)}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <ImageIcon sx={{ fontSize: 36, color: "#2563eb" }} />
                  <Typography variant="subtitle2" fontWeight="bold">
                    Select Banner Image
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Browse from the media library or upload a file
                  </Typography>
                </Box>
              </Paper>

              {formData.productDetails?.banner?.image && (
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    borderColor: "divider",
                    position: "relative",
                  }}
                >
                  <Box sx={{ position: "relative", width: "100%", height: 160, borderRadius: 1.5, overflow: "hidden" }}>
                    <Image
                      src={formData.productDetails.banner.image}
                      alt="Banner Preview"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => {
                      handleChange("productDetails.banner.image", "");
                      setBannerImageFile(null);
                    }}
                    sx={{ mt: 1.5, textTransform: "none", borderRadius: 1.5 }}
                  >
                    Remove Banner
                  </Button>
                </Card>
              )}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Alt Text"
                  size="small"
                  value={formData.productDetails?.banner?.alt || ""}
                  onChange={(e) => handleChange("productDetails.banner.alt", e.target.value)}
                  fullWidth
                  placeholder="SEO description"
                />
                <TextField
                  label="Main Title"
                  size="small"
                  value={formData.productDetails?.banner?.title || ""}
                  onChange={(e) => handleChange("productDetails.banner.title", e.target.value)}
                  fullWidth
                  placeholder="Overlay Title"
                />
                <TextField
                  label="Subtitle"
                  size="small"
                  value={formData.productDetails?.banner?.subtitle || ""}
                  onChange={(e) => handleChange("productDetails.banner.subtitle", e.target.value)}
                  fullWidth
                  placeholder="Supporting Text"
                />
              </Box>
            </Stack>

            <MediaPickerModal
              open={bannerPickerOpen}
              onClose={() => setBannerPickerOpen(false)}
              onSelect={(file: any) => {
                handleChange("productDetails.banner.image", file.url);
                setBannerImageFile(null);
              }}
              title="Select Banner Image"
            />
          </Box>
        );

      case "features":
        if (isSectionDisabled("productDetails.features.enabled")) {
          return renderDisabledNotice("Features & Checklist", "productDetails.features.enabled");
        }
        return (
          <Box>
            {renderSectionHeader("Features & Checklist", "Highlight standout product features and checklist points side-by-side.", "productDetails.features.enabled")}
            <Stack spacing={2.5}>
              <TextField
                label="Section Custom Title"
                size="small"
                value={formData.productDetails?.features?.title || ""}
                onChange={(e) => handleChange("productDetails.features.title", e.target.value)}
                fullWidth
                placeholder="Standout Features"
              />
              <TextField
                label="Features Overview Description"
                size="small"
                value={formData.productDetails?.features?.description || ""}
                onChange={(e) => handleChange("productDetails.features.description", e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Brief summary paragraph introducing key features..."
              />

              <Divider />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                {/* Feature Points list */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                      Feature Points ({(formData.productDetails?.features?.featurePoints || []).length})
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addFeaturePoint}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "none", borderRadius: 1.5 }}
                    >
                      Add Point
                    </Button>
                  </Box>

                  <Stack spacing={1.5}>
                    {(formData.productDetails?.features?.featurePoints || []).map((point: any, index: number) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "#f8fafc",
                          borderRadius: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 1, alignItems: "start" }}>
                          <Stack spacing={1} sx={{ flex: 1 }}>
                            <TextField
                              label="Title"
                              size="small"
                              value={point.title || ""}
                              onChange={(e) => {
                                const points = [...(formData.productDetails?.features?.featurePoints || [])];
                                points[index].title = e.target.value;
                                handleChange("productDetails.features.featurePoints", points);
                              }}
                              fullWidth
                            />
                            <TextField
                              label="Description"
                              size="small"
                              value={point.content || ""}
                              onChange={(e) => {
                                const points = [...(formData.productDetails?.features?.featurePoints || [])];
                                points[index].content = e.target.value;
                                handleChange("productDetails.features.featurePoints", points);
                              }}
                              fullWidth
                              multiline
                              rows={2}
                            />
                          </Stack>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeFeaturePoint(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>

                {/* Checklist list */}
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                      Checklist Items ({(formData.productDetails?.features?.checklist || []).length})
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={addChecklistItem}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "none", borderRadius: 1.5 }}
                    >
                      Add Item
                    </Button>
                  </Box>

                  <Stack spacing={1.5}>
                    {(formData.productDetails?.features?.checklist || []).map((item: string, index: number) => (
                      <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <TextField
                          label={`Item ${index + 1}`}
                          size="small"
                          value={item || ""}
                          onChange={(e) => {
                            const checklist = [...(formData.productDetails?.features?.checklist || [])];
                            checklist[index] = e.target.value;
                            handleChange("productDetails.features.checklist", checklist);
                          }}
                          fullWidth
                        />
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeChecklistItem(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Stack>
          </Box>
        );

      case "productPoints":
        if (isSectionDisabled("productDetails.productPoints.enabled")) {
          return renderDisabledNotice("Product Points", "productDetails.productPoints.enabled");
        }
        return (
          <Box>
            {renderSectionHeader("Product Points", "Write concise product bullet points commonly visible on store headers.", "productDetails.productPoints.enabled")}
            <Stack spacing={2}>
              <TextField
                label="Section Custom Title"
                size="small"
                value={formData.productDetails?.productPoints?.title || ""}
                onChange={(e) => handleChange("productDetails.productPoints.title", e.target.value)}
                fullWidth
                placeholder="Product Highlights"
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  Highlights ({(formData.productDetails?.productPoints?.points || []).length})
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addProductPoint}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 1.5 }}
                >
                  Add Point
                </Button>
              </Box>

              {(formData.productDetails?.productPoints?.points || []).map((point: string, index: number) => (
                <Box key={index} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <TextField
                    label={`Point ${index + 1}`}
                    size="small"
                    value={point || ""}
                    onChange={(e) => {
                      const points = [...(formData.productDetails?.productPoints?.points || [])];
                      points[index] = e.target.value;
                      handleChange("productDetails.productPoints.points", points);
                    }}
                    fullWidth
                  />
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => removeProductPoint(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        );

      case "specifications":
        if (isSectionDisabled("productDetails.specifications.enabled")) {
          return renderDisabledNotice("Specifications", "productDetails.specifications.enabled");
        }
        return (
          <Box>
            {renderSectionHeader("Specifications", "Key technical and physical product specification details.", "productDetails.specifications.enabled")}
            <Stack spacing={2}>
              <TextField
                label="Section Custom Title"
                size="small"
                value={formData.productDetails?.specifications?.title || ""}
                onChange={(e) => handleChange("productDetails.specifications.title", e.target.value)}
                fullWidth
                placeholder="Technical Specifications"
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  Specification Items ({(formData.productDetails?.specifications?.items || []).length})
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addSpecification}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 1.5 }}
                >
                  Add Spec
                </Button>
              </Box>

              {(formData.productDetails?.specifications?.items || []).map((spec: any, index: number) => (
                <Box key={index} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <TextField
                    label="Spec Title"
                    size="small"
                    value={spec.title || ""}
                    onChange={(e) => {
                      const specs = [...(formData.productDetails?.specifications?.items || [])];
                      specs[index].title = e.target.value;
                      handleChange("productDetails.specifications.items", specs);
                    }}
                    placeholder="e.g., Material"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Value"
                    size="small"
                    value={spec.value || ""}
                    onChange={(e) => {
                      const specs = [...(formData.productDetails?.specifications?.items || [])];
                      specs[index].value = e.target.value;
                      handleChange("productDetails.specifications.items", specs);
                    }}
                    placeholder="e.g., 100% Cotton"
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => removeSpecification(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        );

      case "reviews":
        if (isSectionDisabled("productDetails.reviews.enabled")) {
          return renderDisabledNotice("Customer Reviews", "productDetails.reviews.enabled");
        }
        return (
          <Box>
            {renderSectionHeader("Customer Reviews", "Configure dummy customer reviews shown on launch.", "productDetails.reviews.enabled")}
            <Stack spacing={2}>
              <TextField
                label="Section Custom Title"
                size="small"
                value={formData.productDetails?.reviews?.title || ""}
                onChange={(e) => handleChange("productDetails.reviews.title", e.target.value)}
                fullWidth
                placeholder="What Customers Say"
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  Reviews List ({(formData.productDetails?.reviews?.userReviews || []).length})
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addUserReview}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 1.5 }}
                >
                  Add Review
                </Button>
              </Box>

              {(formData.productDetails?.reviews?.userReviews || []).map((review: any, index: number) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "#f8fafc",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "start" }}>
                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Reviewer Name"
                          size="small"
                          value={review.name || ""}
                          onChange={(e) => {
                            const userReviews = [...(formData.productDetails?.reviews?.userReviews || [])];
                            userReviews[index].name = e.target.value;
                            handleChange("productDetails.reviews.userReviews", userReviews);
                          }}
                          fullWidth
                        />
                        <TextField
                          label="Avatar Image URL (Optional)"
                          size="small"
                          value={review.avatar || ""}
                          onChange={(e) => {
                            const userReviews = [...(formData.productDetails?.reviews?.userReviews || [])];
                            userReviews[index].avatar = e.target.value;
                            handleChange("productDetails.reviews.userReviews", userReviews);
                          }}
                          fullWidth
                          placeholder="https://..."
                        />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">RATING</Typography>
                          <Rating
                            value={review.rating || 5}
                            onChange={(e, val) => {
                              const userReviews = [...(formData.productDetails?.reviews?.userReviews || [])];
                              userReviews[index].rating = val || 5;
                              handleChange("productDetails.reviews.userReviews", userReviews);
                            }}
                          />
                        </Box>
                        <TextField
                          label="Review Date"
                          size="small"
                          value={review.date || ""}
                          onChange={(e) => {
                            const userReviews = [...(formData.productDetails?.reviews?.userReviews || [])];
                            userReviews[index].date = e.target.value;
                            handleChange("productDetails.reviews.userReviews", userReviews);
                          }}
                          fullWidth
                          placeholder="e.g. October 15, 2025"
                        />
                        <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
                          <TextField
                            label="Review Comment"
                            size="small"
                            value={review.comment || ""}
                            onChange={(e) => {
                              const userReviews = [...(formData.productDetails?.reviews?.userReviews || [])];
                              userReviews[index].comment = e.target.value;
                              handleChange("productDetails.reviews.userReviews", userReviews);
                            }}
                            fullWidth
                            multiline
                            rows={2}
                          />
                        </Box>
                      </Box>
                    </Stack>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => removeUserReview(index)}
                      sx={{ mt: 0.5 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        );

      case "faq":
        if (isSectionDisabled("productDetails.faq.enabled")) {
          return renderDisabledNotice("Frequently Asked Questions", "productDetails.faq.enabled");
        }
        return (
          <Box>
            {renderSectionHeader("Frequently Asked Questions", "Maintain commonly asked question-and-answer specs.", "productDetails.faq.enabled")}
            <Stack spacing={2}>
              <TextField
                label="Section Custom Title"
                size="small"
                value={formData.productDetails?.faq?.title || ""}
                onChange={(e) => handleChange("productDetails.faq.title", e.target.value)}
                fullWidth
                placeholder="FAQs"
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  FAQs List ({(formData.productDetails?.faq?.questions || []).length})
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addFAQ}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "none", borderRadius: 1.5 }}
                >
                  Add FAQ
                </Button>
              </Box>

              {(formData.productDetails?.faq?.questions || []).map((faq: any, index: number) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "#f8fafc",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "start" }}>
                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      <TextField
                        label="Question"
                        size="small"
                        value={faq.question || ""}
                        onChange={(e) => {
                          const faqs = [...(formData.productDetails?.faq?.questions || [])];
                          faqs[index].question = e.target.value;
                          handleChange("productDetails.faq.questions", faqs);
                        }}
                        fullWidth
                      />
                      <TextField
                        label="Answer"
                        size="small"
                        value={faq.answer || ""}
                        onChange={(e) => {
                          const faqs = [...(formData.productDetails?.faq?.questions || [])];
                          faqs[index].answer = e.target.value;
                          handleChange("productDetails.faq.questions", faqs);
                        }}
                        fullWidth
                        multiline
                        rows={2}
                      />
                    </Stack>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => removeFAQ(index)}
                      sx={{ mt: 0.5 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Title block */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ color: "#2563eb", fontSize: { xs: "0.9rem", xl: "1.25rem" } }}
        >
          {isBundle ? "Bundle Product Details" : "Product Details"}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "10px", xl: "12px" } }}>
          Configure tabs, specs, features, FAQs, and custom banners for this product page.
        </Typography>
      </Box>

      {/* Modern Dashboard side-by-side tabs layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "240px 1fr" },
          gap: 3,
          width: "100%",
        }}
      >
        {/* Left Tabs List */}
        <Box>
          <Stack spacing={1}>
            {activeTabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              const isEnabled = tab.enabledPath ? getNestedValue(formData, tab.enabledPath) !== false : true;
              return (
                <Paper
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: isSelected ? "#3b82f6" : "#e2e8f0",
                    bgcolor: isSelected ? "rgba(59, 130, 246, 0.04)" : "background.paper",
                    borderRadius: 2.5,
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: isSelected ? "#3b82f6" : "#cbd5e1",
                      bgcolor: isSelected ? "rgba(59, 130, 246, 0.04)" : "rgba(0,0,0,0.01)",
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={isSelected ? "bold" : "medium"}
                    color={isSelected ? "#2563eb" : "text.secondary"}
                  >
                    {tab.label}
                  </Typography>
                  {tab.enabledPath && (
                    <Switch
                      size="small"
                      checked={isEnabled}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleChange(tab.enabledPath!, e.target.checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </Paper>
              );
            })}
          </Stack>
        </Box>

        {/* Right Active Tab Settings Panel */}
        <Box sx={{ width: "100%", minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "#e2e8f0",
              bgcolor: "background.paper",
              minHeight: 450,
              width: "100%",
            }}
          >
            {renderActiveTabContent()}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
