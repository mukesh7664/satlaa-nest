"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  TextField,
  Typography,
  Chip,
  Autocomplete,
  CircularProgress,
  Paper,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import { flagsApi, Flag } from "@/services/flags.api";
import { tagsApi, Tag } from "@/services/tags.api";

interface SEOStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function SEOStep({ formData, setFormData }: SEOStepProps) {
  const [allFlags, setAllFlags] = useState<Flag[]>([]);
  const [loadingFlags, setLoadingFlags] = useState(false);

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  useEffect(() => {
    fetchFlags();
    fetchTags();
  }, []);

  // Derive selected items from formData + all available items
  // This ensures the UI is always in sync with the parent formData
  const getNormId = (obj: any) => obj?.id || obj?._id || (typeof obj === 'string' ? obj : null);

  const selectedFlags = allFlags.filter(flag => {
    const flagIds = (formData.flags || []).map(getNormId).filter(Boolean);
    return flagIds.includes(getNormId(flag));
  });

  const selectedTags = allTags.filter(tag => {
    const tagIds = (formData.tags || []).map(getNormId).filter(Boolean);
    return tagIds.includes(getNormId(tag));
  });

  // Sync objects from formData into master lists on load/update
  useEffect(() => {
    if (formData.flags && Array.isArray(formData.flags)) {
      const objects = formData.flags.filter((f: Flag | string) => typeof f === 'object');
      if (objects.length > 0) {
        setAllFlags(prev => {
          const merged = [...prev];
          objects.forEach((obj: Flag) => {
            if (!merged.some((m: Flag) => getNormId(m) === getNormId(obj))) merged.push(obj);
          });
          return merged;
        });
      }
    }
    if (formData.tags && Array.isArray(formData.tags)) {
      const objects = formData.tags.filter((t: Tag | string) => typeof t === 'object');
      if (objects.length > 0) {
        setAllTags(prev => {
          const merged = [...prev];
          objects.forEach((obj: Tag) => {
            if (!merged.some((m: Tag) => getNormId(m) === getNormId(obj))) merged.push(obj);
          });
          return merged;
        });
      }
    }
  }, [formData.flags, formData.tags]);

  // Auto-generate slug and meta title from product title if they are empty
  useEffect(() => {
    const title = formData.productInfo?.title || "";
    if (title && !formData.slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      handleChange("slug", generatedSlug);
    }
    if (title && !formData.seo?.title) {
        handleChange("seo.title", title);
    }
  }, [formData.productInfo?.title]);

  const fetchFlags = async () => {
    try {
      setLoadingFlags(true);
      const response = await flagsApi.getAllFlags();
      setAllFlags(response.flags || []);
    } catch (error) {
      console.error("Failed to fetch flags:", error);
    } finally {
      setLoadingFlags(false);
    }
  };

  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      const response = await tagsApi.getAllTags();
      setAllTags(response.tags || []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleSearchFlags = async (query: string) => {
    if (!query.trim()) {
      fetchFlags();
      return;
    }
    try {
      setLoadingFlags(true);
      const response = await flagsApi.searchFlags(query);
      const results = response.flags || [];
      // Merge with currently selected to ensure they don't disappear from the UI
      setAllFlags(prev => {
        const merged = [...results];
        selectedFlags.forEach(sel => {
          if (!merged.find(m => (m.id || m._id) === (sel.id || sel._id))) {
            merged.push(sel);
          }
        });
        return merged;
      });
    } catch (error) {
      console.error("Failed to search flags:", error);
    } finally {
      setLoadingFlags(false);
    }
  };

  const handleSearchTags = async (query: string) => {
    if (!query.trim()) {
      fetchTags();
      return;
    }
    try {
      setLoadingTags(true);
      const response = await tagsApi.searchTags(query);
      const results = response.tags || [];
      setAllTags(prev => {
        const merged = [...results];
        selectedTags.forEach(sel => {
          if (!merged.find(m => (m.id || m._id) === (sel.id || sel._id))) {
            merged.push(sel);
          }
        });
        return merged;
      });
    } catch (error) {
      console.error("Failed to search tags:", error);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleFlagChange = async (event: any, newValue: (Flag | string)[]) => {
    const existingFlags: Flag[] = [];
    const newFlagNames: string[] = [];

    newValue.forEach(item => {
      if (typeof item === "string") newFlagNames.push(item);
      else existingFlags.push(item);
    });

    const createdFlags: Flag[] = [];
    for (const name of newFlagNames) {
      try {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        const response = await flagsApi.createFlag(name.trim(), randomColor);
        createdFlags.push(response.flag);
        setAllFlags(prev => [...prev, response.flag]);
      } catch (error) {
        console.error(`Failed to create flag "${name}":`, error);
      }
    }

    const updatedSelectedFlags = [...existingFlags, ...createdFlags];
    setFormData((prev: any) => ({
      ...prev,
      flags: updatedSelectedFlags.map(f => f.id || f._id),
    }));
  };

  const handleTagChange = async (event: any, newValue: (Tag | string)[]) => {
    const existingTags: Tag[] = [];
    const newTagNames: string[] = [];

    newValue.forEach(item => {
      if (typeof item === "string") newTagNames.push(item);
      else existingTags.push(item);
    });

    const createdTags: Tag[] = [];
    for (const name of newTagNames) {
      try {
        const response = await tagsApi.createTag(name.trim());
        createdTags.push(response.tag);
        setAllTags(prev => [...prev, response.tag]);
      } catch (error) {
        console.error(`Failed to create tag "${name}":`, error);
      }
    }

    const updatedSelectedTags = [...existingTags, ...createdTags];
    setFormData((prev: any) => ({
      ...prev,
      tags: updatedSelectedTags.map(t => t.id || t._id),
      seo: {
        ...(prev.seo || {}),
        keywords: updatedSelectedTags.map(t => t.name)
      }
    }));
  };

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData };
    const fields = field.split(".");
    let current: any = newData;
    for (let i = 0; i < fields.length - 1; i++) {
      current = current[fields[i]];
    }
    current[fields[fields.length - 1]] = value;
    setFormData(newData);
  };

  return (
    <Box>
      <Box sx={{ mb: { xs: 1.5, xl: 3 } }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: "primary.main", fontSize: { xs: '0.9rem', xl: '1.25rem' } }}>
          Final Settings & Badges
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '10px', xl: '12px' } }}>
          Configure badges, visibility tags, and SEO.
        </Typography>
      </Box>

      <Stack spacing={4}>
        <Paper elevation={0} sx={{ p: { xs: 1.5, xl: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 4, bgcolor: "grey.50" }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: { xs: 1.5, xl: 3 }, display: "flex", alignItems: "center", gap: 1, fontSize: { xs: 11, xl: 14 } }}>
            <Box sx={{ width: 4, height: { xs: 14, xl: 18 }, bgcolor: "primary.main", borderRadius: 1 }} />
            1. Badges & Product Tags
          </Typography>

          <Stack spacing={4}>
            {/* Flags */}
            <Box>
              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: "block", textTransform: "uppercase", fontSize: { xs: 9, xl: 11 } }}>
                Product Badges (Flags)
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={allFlags}
                value={selectedFlags}
                onChange={handleFlagChange}
                onInputChange={(_e, val) => handleSearchFlags(val)}
                loading={loadingFlags}
                getOptionLabel={(option: Flag | string) => (typeof option === "string" ? option : option.name)}
                isOptionEqualToValue={(option: Flag, value: Flag) => (option.id || option._id) === (value.id || value._id)}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search or add badges..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingFlags ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderTags={(value: Flag[], getTagProps: any) =>
                  value.map((option: Flag, index: number) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id || option._id || index}
                      label={option.name}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{
                        backgroundColor: option.color ? `${option.color}20` : undefined,
                        borderColor: option.color || undefined,
                        fontWeight: 500
                      }}
                    />
                  ))
                }
              />
            </Box>

            {/* Tags */}
            <Box>
              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: "block", textTransform: "uppercase", fontSize: { xs: 9, xl: 11 } }}>
                Product Keywords (Tags)
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={allTags}
                value={selectedTags}
                onChange={handleTagChange}
                onInputChange={(_e, val) => handleSearchTags(val)}
                loading={loadingTags}
                getOptionLabel={(option: Tag | string) => (typeof option === "string" ? option : option.name)}
                isOptionEqualToValue={(option: Tag, value: Tag) => (option.id || option._id) === (value.id || value._id)}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search or add tags..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingTags ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderTags={(value: Tag[], getTagProps: any) =>
                  value.map((option: Tag, index: number) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id || option._id || index}
                      label={option.name}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  ))
                }
              />
            </Box>
          </Stack>

          <Divider sx={{ my: 4 }} />

          <Box>
            <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: "block", textTransform: "uppercase" }}>
              Initial Visibility & Status
            </Typography>
            <Stack direction="row" spacing={4} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={formData.isActive !== false}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight="500" sx={{ fontSize: { xs: 11, xl: 14 } }}>
                    Active
                  </Typography>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={formData.showInMarketplace === true}
                    onChange={(e) => handleChange("showInMarketplace", e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight="500" sx={{ fontSize: { xs: 11, xl: 14 } }}>
                    Marketplace
                  </Typography>
                }
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              (Active products are visible on your store. Marketplace products are also visible on the platform's central aggregator.)
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 1.5, xl: 3 }, border: "1px solid", borderColor: "divider", borderRadius: 4 }}>
          <Typography variant="subtitle2" fontWeight="700" sx={{ mb: { xs: 1.5, xl: 3 }, display: "flex", alignItems: "center", gap: 1, fontSize: { xs: 11, xl: 14 } }}>
            <Box sx={{ width: 4, height: { xs: 14, xl: 18 }, bgcolor: "success.main", borderRadius: 1 }} />
            2. Search Engine Optimization (SEO)
          </Typography>

          <Stack spacing={{ xs: 1, xl: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 1.5, xl: 2 } }}>
              <TextField
                label="URL Slug"
                size="small"
                value={formData.slug || ""}
                onChange={(e) => handleChange("slug", e.target.value)}
                fullWidth
                InputProps={{ sx: { height: 32, fontSize: 11 } }}
              />
              <TextField
                label="Meta Title"
                size="small"
                value={formData.seo?.title || ""}
                onChange={(e) => handleChange("seo.title", e.target.value)}
                fullWidth
                InputProps={{ sx: { height: 32, fontSize: 11 } }}
              />
            </Box>
            <TextField
              label="Meta Description"
              size="small"
              value={formData.seo?.metaDescription || ""}
              onChange={(e) => handleChange("seo.metaDescription", e.target.value)}
              fullWidth
              multiline
              rows={1}
              InputProps={{ sx: { fontSize: 11 } }}
            />
            <Box sx={{ pt: 1, borderTop: "1px dashed", borderColor: "divider" }}>
              <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 0.5, display: "block", fontSize: 9 }}>
                Internal Admin Notes
              </Typography>
              <TextField
                placeholder="Internal notes..."
                size="small"
                value={formData.adminNotes || ""}
                onChange={(e) => handleChange("adminNotes", e.target.value)}
                fullWidth
                multiline
                rows={1}
                InputProps={{ sx: { fontSize: 11 } }}
              />
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
