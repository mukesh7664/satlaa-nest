import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { sectionApi, ISectionType as ISection } from "@/services/section.api";

interface SectionDialogProps {
  open: boolean;
  onClose: () => void;
  section: ISection | null;
  onSave: () => void;
}

export const SECTION_TYPES = [
  "Hero",
  "AboutUsHero",
  "ServiceHero",
  "TopCategories",
  "TopSelling",
  "TopTrending",
  "Banner",
  "DualBanner",
  "SoftwareFor",
  "Reviews",
  "Testimonials",
  "TrustedBrands",
  "Articles",
  "BlogHero",
  "BlogRecent",
  "Empowering",
  "UnlockPotential",
  "Banner2",
  "TeamTools",
  "SoftwareCollection",
  "DlpFeatures",
  "PowerfulFeatures",
  "TopBundles",
  "BrandFAQ",
  "FAQ",
  "RoundCollection",
  "CategoryGrid",
  "ProductHighlight",
  "BulkOrder",
  "CollectionList",
  "DualBannerWithSection",
  "EventHero",
  "FeaturedArtists",
  "WhatWeOffer",
  "Partners",
  "AboutEvent",
  "PreviousEditions",
  "Sponsorship",
  "EventHeader",
  "EventFooter",
  "SamajAbout",
  "SamajHeroBanner",
  "SamajRecentEvents",
  "SamajGallery",
  "SamajHeader",
  "HeaderMain",
  "FooterMain",
  "AyojakMembers",
  "SamajHelp",
  "SamajAboutHero",
  "QuickAbout",
  "SamajContactInfo",
  "WhyChooseSamaj",
  "SamajEventSlider",
  "SamajCommittee",
  "AutoServicesHero",
  "AutoServicesBrandMarquee",
  "AutoServicesCategoryGrid",
  "AutoServicesPromotionBanner",
  "AutoServicesProductTabs",
  "AutoServicesBigBanner",
  "AutoServicesServiceFeatures",
  "AutoServicesNewsletter",
  "AutoServicesPartFinder",
  "AutoServicesReviews",
];

export default function SectionDialog({
  open,
  onClose,
  section,
  onSave,
}: SectionDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    category: "section" as "header" | "footer" | "section" | "cart" | "checkout" | "product",
    scope: "both",
    data: "{}",
    tags: "",
    isActive: true,
  });
  const [tagList, setTagList] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name,
        type: section.type,
        category: section.category || "section",
        scope: section.scope || "both",
        data: section.data ? JSON.stringify(section.data, null, 2) : "{}",
        tags: "",
        isActive: section.isActive ?? true,
      });
      setTagList(section.tags || []);
    } else {
      setFormData({
        name: "",
        type: "",
        category: "section",
        scope: "both",
        data: '{\n  "title": "Enter Title",\n  "subtitle": "Enter Subtitle",\n  "image": "/images/placeholder.jpg",\n  "collection": "generic"\n}',
        tags: "",
        isActive: true,
      });
      setTagList([]);
    }
  }, [section, open]);

  const handleAddTag = () => {
    if (formData.tags && !tagList.includes(formData.tags.trim())) {
      setTagList([...tagList, formData.tags.trim()]);
      setFormData({ ...formData, tags: "" });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagList(tagList.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      let parsedData = {};
      try {
        parsedData = JSON.parse(formData.data);
      } catch (e) {
        alert("Invalid JSON in Data field");
        setSaving(false);
        return;
      }

      const payload = {
        name: formData.name,
        type: formData.type,
        category: formData.category,
        scope: formData.scope,
        data: parsedData,
        tags: tagList,
        isActive: formData.isActive,
      };

      if (section) {
        await sectionApi.update(section._id || section.id, payload);
      } else {
        await sectionApi.create(payload);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to save section:", error);
      alert("Failed to save section");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{section ? "Edit Section" : "Create Section"}</DialogTitle>
      <DialogContent className="product-form-container">
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Section Name (Internal)"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>Section Category</InputLabel>
            <Select
              value={formData.category}
              label="Section Category"
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as any })
              }
            >
              <MenuItem value="section">Page Section</MenuItem>
              <MenuItem value="header">Header</MenuItem>
              <MenuItem value="footer">Footer</MenuItem>
              <MenuItem value="cart">Cart Page</MenuItem>
              <MenuItem value="checkout">Checkout Page</MenuItem>
              <MenuItem value="product">Product Detail</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Section Scope</InputLabel>
            <Select
              value={formData.scope}
              label="Section Scope"
              onChange={(e) =>
                setFormData({ ...formData, scope: e.target.value })
              }
            >
              <MenuItem value="both">Both (Universal)</MenuItem>
              <MenuItem value="page-builder">Page Builder Only</MenuItem>
              <MenuItem value="ecommerce">E-commerce Only</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Section Type (Rendering Key)</InputLabel>
            <Select
              value={formData.type}
              label="Section Type (Rendering Key)"
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              MenuProps={{
                PaperProps: { sx: { maxHeight: 300 } },
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
              }}
            >
              {SECTION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              {tagList.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Add tag..."
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button variant="outlined" onClick={handleAddTag}>
                Add
              </Button>
            </Stack>
          </Box>

          <TextField
            label="Configuration Data (JSON)"
            fullWidth
            multiline
            rows={10}
            value={formData.data}
            onChange={(e) =>
              setFormData({ ...formData, data: e.target.value })
            }
            helperText="Enter the content for this section in JSON format."
            sx={{ fontFamily: "monospace" }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving || !formData.name || !formData.type}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
