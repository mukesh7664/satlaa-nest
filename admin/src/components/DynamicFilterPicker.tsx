"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  InputAdornment
} from "@mui/material";
import {
  Edit as EditIcon,
  DeleteOutline as DeleteOutlineIcon,
  FilterAlt as FilterIcon,
  FolderOpen as CategoryIcon,
  CollectionsBookmark as CollectionIcon,
  Flag as FlagIcon,
  LocalOffer as TagIcon,
  Search as SearchIcon,
  Check as CheckIcon
} from "@mui/icons-material";
import { categoriesApi } from "@/services/categories.api";
import { collectionsApi } from "@/services/collections.api";
import { flagsApi } from "@/services/flags.api";
import { tagsApi } from "@/services/tags.api";

export interface SelectedFilter {
  type: "category" | "collection" | "flag" | "tag";
  value: string;
  name: string;
}

interface DynamicFilterPickerProps {
  label?: string;
  value?: SelectedFilter | null;
  onChange: (filter: SelectedFilter | null) => void;
}

export default function DynamicFilterPicker({
  label = "Dynamic Filter Rule",
  value,
  onChange
}: DynamicFilterPickerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Loaded data
  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;

    const fetchFilterOptions = async () => {
      setLoading(true);
      try {
        const [catsRes, collsRes, flagsRes, tagsRes] = await Promise.all([
          categoriesApi.getAllCategories().catch(() => []),
          collectionsApi.getAllCollections({ limit: 100 }).catch(() => ({ collections: [] })),
          flagsApi.getAllFlags().catch(() => ({ flags: [] })),
          tagsApi.getAllTags().catch(() => ({ tags: [] })),
        ]);
        setCategories(Array.isArray(catsRes) ? catsRes : []);
        setCollections(collsRes?.collections || []);
        setFlags(flagsRes?.flags || []);
        setTags(tagsRes?.tags || []);
      } catch (err) {
        console.error("Error loading filter picker options:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, [modalOpen]);

  const handleOpenModal = () => {
    setSearchQuery("");
    if (value) {
      if (value.type === "category") setActiveTab(0);
      else if (value.type === "collection") setActiveTab(1);
      else if (value.type === "flag") setActiveTab(2);
      else if (value.type === "tag") setActiveTab(3);
    }
    setModalOpen(true);
  };

  const handleSelect = (type: SelectedFilter["type"], itemVal: string, itemName: string) => {
    onChange({ type, value: itemVal, name: itemName });
    setModalOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const getFilterIcon = (type: SelectedFilter["type"], sxProps?: any) => {
    switch (type) {
      case "category": return <CategoryIcon sx={sxProps} />;
      case "collection": return <CollectionIcon sx={sxProps} />;
      case "flag": return <FlagIcon sx={sxProps} />;
      case "tag": return <TagIcon sx={sxProps} />;
    }
  };

  const getFilteredList = () => {
    const q = searchQuery.toLowerCase();
    switch (activeTab) {
      case 0:
        return categories
          .filter(c => c.name.toLowerCase().includes(q))
          .map(c => ({ id: c.slug, name: c.name, type: "category" as const }));
      case 1:
        return collections
          .filter(c => c.name.toLowerCase().includes(q))
          .map(c => ({ id: c.slug, name: c.name, type: "collection" as const }));
      case 2:
        return flags
          .filter(f => f.name.toLowerCase().includes(q))
          .map(f => ({ id: f.id, name: f.name, type: "flag" as const }));
      case 3:
        return tags
          .filter(t => t.name.toLowerCase().includes(q))
          .map(t => ({ id: t.id, name: t.name, type: "tag" as const }));
      default:
        return [];
    }
  };

  const items = getFilteredList();

  return (
    <Box className="space-y-2">
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
          {label}
        </Typography>
      )}

      {value ? (
        <Box
          onClick={handleOpenModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            border: "1px solid #cbd5e1",
            borderRadius: 2,
            cursor: "pointer",
            bgcolor: "#f8fafc",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#f1f5f9",
              borderColor: "#94a3b8"
            }
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {getFilterIcon(value.type, { color: "primary.main" })}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize", display: "block", fontWeight: 500 }}>
                {value.type}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                {value.name}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }} onClick={e => e.stopPropagation()}>
            <IconButton size="small" onClick={handleOpenModal}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={handleClear}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={handleOpenModal}
          sx={{
            border: "1px dashed #cbd5e1",
            borderRadius: 2,
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            cursor: "pointer",
            bgcolor: "#fafafa",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "#f1f5f9",
              borderColor: "primary.main"
            }
          }}
        >
          <FilterIcon sx={{ color: "#94a3b8", fontSize: 28 }} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5
            }}
          >
            Configure Product Filter
          </Button>
        </Box>
      )}

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
          Select Product Filter
          <Typography variant="body2" color="text.secondary">
            Products will be loaded dynamically from the chosen rule.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => {
              setActiveTab(val);
              setSearchQuery("");
            }}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<CategoryIcon />} label="Category" iconPosition="start" sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab icon={<CollectionIcon />} label="Collection" iconPosition="start" sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab icon={<FlagIcon />} label="Flag" iconPosition="start" sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab icon={<TagIcon />} label="Tag" iconPosition="start" sx={{ textTransform: "none", fontWeight: 600 }} />
          </Tabs>

          <Box sx={{ p: 2 }}>
            <TextField
              placeholder="Search..."
              fullWidth
              size="small"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />

            {loading ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 1.5 }}>
                <CircularProgress size={30} />
                <Typography variant="body2" color="text.secondary">Fetching options...</Typography>
              </Box>
            ) : items.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
                <Typography variant="body2">No matching items found</Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 320, overflow: "auto", border: "1px solid #eaeaea", borderRadius: 2 }}>
                {items.map(item => {
                  const isSelected = value?.type === item.type && value?.value === item.id;
                  return (
                    <ListItem key={item.id} disablePadding divider>
                      <ListItemButton onClick={() => handleSelect(item.type, item.id, item.name)}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getFilterIcon(item.type, { color: isSelected ? "primary.main" : "action.active" })}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.name}
                          primaryTypographyProps={{
                            fontWeight: isSelected ? "bold" : "normal",
                            color: isSelected ? "primary.main" : "text.primary"
                          }}
                        />
                        {isSelected && <CheckIcon color="primary" fontSize="small" />}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
