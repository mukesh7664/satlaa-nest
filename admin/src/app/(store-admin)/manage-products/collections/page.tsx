"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Autocomplete,
  Stack,
  Tooltip,
  Avatar,
  Box,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import { collectionsApi, Collection } from "@/services/collections.api";
import { tagsApi, Tag } from "@/services/tags.api";
import MediaPickerModal from "@/components/MediaPickerModal";
import { useAppSelector } from "@/store/hooks";

export default function CollectionsPage() {
  const router = useRouter();
  const { admin } = useAppSelector((state) => state.auth);
  // Using collections.edit if available, fallback to products.manage or super_admin or admin
  const canEdit =
    admin?.role === "admin" ||
    admin?.role === "admin" ||
    admin?.role === "admin" ||
    admin?.permissions?.includes("collections.edit") ||
    admin?.permissions?.includes("products.manage");

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );

  // Pagination and search state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCollections, setTotalCollections] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "manual" as "manual" | "automatic",
    tags: [] as string[],
    conditions: "any" as "all" | "any",
    isActive: true,
    showInSearchBar: true,
    showInFilterBar: true,
    icon: "", // URL
    image: "", // URL (Banner)
  });

  // Media Picker State
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);

  // Tags for automatic collections
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [creatingTag, setCreatingTag] = useState(false);

  useEffect(() => {
    fetchCollections();
    fetchTags();
  }, [page, rowsPerPage, searchQuery]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await collectionsApi.getAllCollections({
        limit: rowsPerPage,
        page: page + 1,
        search: searchQuery || undefined,
      });
      setCollections(response.collections || []);
      setTotalCollections(response.pagination.total);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await tagsApi.getAllTags();
      setAllTags(response.tags || []);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  const handleOpenDialog = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        name: collection.name,
        description: collection.description || "",
        type: collection.type,
        tags: collection.rules?.tags || [],
        conditions: collection.rules?.conditions || "any",
        isActive: collection.isActive,
        showInSearchBar: collection.showInSearchBar ?? true,
        showInFilterBar: collection.showInFilterBar ?? true,
        icon: collection.icon || "",
        image: collection.image || "",
      });

      if (collection.rules?.tags && allTags.length > 0) {
        const selected = allTags.filter((tag) =>
          collection.rules!.tags!.includes(tag.id)
        );
        setSelectedTags(selected);
      }
    } else {
      setEditingCollection(null);
      setFormData({
        name: "",
        description: "",
        type: "manual",
        tags: [],
        conditions: "any",
        isActive: true,
        showInSearchBar: true,
        showInFilterBar: true,
        icon: "",
        image: "",
      });
      setSelectedTags([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCollection(null);
    setFormData({
      name: "",
      description: "",
      type: "manual",
      tags: [],
      conditions: "any",
      isActive: true,
      showInSearchBar: true,
      showInFilterBar: true,
      icon: "",
      image: "",
    });
    setSelectedTags([]);
  };

  const handleIconSelect = (file: any) => {
    setFormData({ ...formData, icon: file.url });
    setIconPickerOpen(false);
  };

  const handleBannerSelect = (file: any) => {
    setFormData({ ...formData, image: file.url }); // 'image' field is used for banner in Collection model
    setBannerPickerOpen(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    if (formData.type === "automatic") {
      if (!formData.tags.length) {
        toast.error("Automatic collections must have at least one tag");
        return;
      }
    }

    try {
      // Use JSON payload instead of FormData for Media Picker compatibility
      const payload: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        isActive: formData.isActive,
        showInSearchBar: formData.showInSearchBar,
        showInFilterBar: formData.showInFilterBar,
        icon: formData.icon,
        image: formData.image,
      };

      if (formData.type === "automatic") {
        payload.rules = {
          tags: formData.tags,
          conditions: formData.conditions,
        };
      }

      // Backend Controller expects 'icon' and 'image' in body if not uploaded as file.
      // But we need to make sure we don't send Full URL if backend expects Key,
      // OR update backend to handle URL.
      // CollectionController checks `req.body` and merges it.
      // It DOES NOT do `getS3KeyFromFile` for body params.
      // So if we send full URL, it saves full URL.
      // `getS3Url` helper in Controller might double-wrap it if it's already a URL.
      // Let's check `getS3Url`: usually it prepends bucket URL if not present.
      // If it's already a URL, we should probably strip the domain or ensure `getS3Url` handles full URLs.
      // However, for consistency with Brands, let's try to extract key if possible,
      // or rely on `getS3Url` being smart.

      // HACK: Extract key if it's a full URL from our bucket
      const extractKey = (url: string) => {
        if (!url) return "";
        if (url.includes(".com/")) {
          return url.split(".com/")[1];
        }
        return url;
      };

      if (payload.icon) payload.icon = extractKey(payload.icon);
      if (payload.image) payload.image = extractKey(payload.image);

      if (editingCollection) {
        await collectionsApi.updateCollection(editingCollection.id, payload);
      } else {
        await collectionsApi.createCollection(payload);
      }

      await fetchCollections();
      handleCloseDialog();
      toast.success(
        editingCollection
          ? "Collection updated successfully"
          : "Collection created successfully"
      );
    } catch (err: any) {
      console.error("Failed to save collection:", err);
      toast.error(err.message || "Failed to save collection");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      await collectionsApi.deleteCollection(id);
      await fetchCollections();
      toast.success("Collection deleted successfully");
    } catch (err) {
      console.error("Failed to delete collection:", err);
      toast.error("Failed to delete collection");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await collectionsApi.toggleStatus(id);
      await fetchCollections();
      toast.success("Collection status updated");
    } catch (err) {
      console.error("Failed to toggle collection status:", err);
      toast.error("Failed to update collection status");
    }
  };

  const handleTagsChange = async (event: any, newValue: (Tag | string)[]) => {
    const existingTags: Tag[] = [];
    const newTagNames: string[] = [];

    for (const item of newValue) {
      if (typeof item === "string") {
        newTagNames.push(item);
      } else {
        existingTags.push(item);
      }
    }

    if (newTagNames.length > 0) {
      setCreatingTag(true);
    }

    const createdTags: Tag[] = [];
    for (const name of newTagNames) {
      try {
        const response = await tagsApi.createTag(name.trim());
        createdTags.push(response.tag);
        setAllTags((prev) => [...prev, response.tag]);
      } catch (error) {
        console.error(`Failed to create tag "${name}":`, error);
        toast.error(`Failed to create tag "${name}"`);
      }
    }

    setCreatingTag(false);
    const allSelectedTags = [...existingTags, ...createdTags];
    setSelectedTags(allSelectedTags);
    setFormData({
      ...formData,
      tags: allSelectedTags.map((tag) => tag.id),
    });
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Collections</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your product collections
          </p>
        </div>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: "var(--primary)",
              "&:hover": {
                bgcolor: "var(--primary)",
                filter: "brightness(0.9)",
              },
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
            }}
          >
            Add Collection
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <TextField
          fullWidth
          placeholder="Search collections by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              setSearchQuery(searchInput);
              setPage(0);
            }
          }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-slate-400" />
              </InputAdornment>
            ),
            endAdornment: searchInput && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchInput("");
                    setSearchQuery("");
                    setPage(0);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 600,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#f8fafc",
              "& fieldset": { borderColor: "#e2e8f0" },
              "&:hover fieldset": { borderColor: "#cbd5e1" },
              "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
            },
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                  Icon
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                  Type
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                  Products
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                  Rules
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 600, color: "#475569" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-500 font-medium">
                        No collections found
                      </p>
                      <p className="text-slate-400 text-sm">
                        Create your first collection!
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                collections.map((collection) => (
                  <TableRow
                    key={collection.id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <Avatar
                        src={collection.icon}
                        variant="rounded"
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {collection.name.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell
                      onClick={() =>
                        router.push(
                          `/manage-products/collections/${collection.id}`
                        )
                      }
                      sx={{ cursor: "pointer" }}
                    >
                      <div>
                        <p className="font-medium text-slate-800 hover:text-blue-600 transition-colors">
                          {collection.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {collection.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          collection.type === "manual" ? "Manual" : "Automatic"
                        }
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: "0.75rem",
                          bgcolor:
                            collection.type === "manual"
                              ? "#eff6ff"
                              : "#fdf4ff",
                          color:
                            collection.type === "manual"
                              ? "#3b82f6"
                              : "#d946ef",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${collection.productCount} products`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 24, fontSize: "0.75rem" }}
                      />
                    </TableCell>
                    <TableCell>
                      {collection.type === "automatic" && collection.rules ? (
                        <div className="flex flex-wrap gap-1">
                          {collection.rules.tags &&
                            collection.rules.tags.length > 0 ? (
                            <>
                              <Tooltip
                                title={
                                  <div>
                                    <p className="font-semibold mb-1">Tags:</p>
                                    {collection.rules.tags.map((tag, idx) => (
                                      <div key={idx}>• {tag.name}</div>
                                    ))}
                                  </div>
                                }
                                arrow
                              >
                                <Chip
                                  label={`${collection.rules.tags.length} tag${collection.rules.tags.length > 1 ? "s" : ""
                                    }`}
                                  size="small"
                                  sx={{
                                    height: 24,
                                    fontSize: "0.75rem",
                                    bgcolor: "#f0fdf4",
                                    color: "#16a34a",
                                    cursor: "help",
                                  }}
                                />
                              </Tooltip>
                              <Chip
                                label={
                                  collection.rules.conditions === "all"
                                    ? "ALL"
                                    : "ANY"
                                }
                                size="small"
                                variant="outlined"
                                sx={{ height: 24, fontSize: "0.7rem" }}
                              />
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No tags
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Manual</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={collection.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={collection.isActive ? "success" : "default"}
                        variant="outlined"
                        onClick={() =>
                          canEdit && handleToggleStatus(collection.id)
                        }
                        sx={{
                          cursor: canEdit ? "pointer" : "default",
                          height: 24,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          size="small"
                          onClick={() =>
                            canEdit && handleToggleStatus(collection.id)
                          }
                          sx={{
                            color: collection.isActive ? "#64748b" : "#94a3b8",
                            cursor: canEdit ? "pointer" : "default",
                          }}
                          disabled={!canEdit}
                        >
                          {collection.isActive ? (
                            <VisibilityIcon fontSize="small" />
                          ) : (
                            <VisibilityOffIcon fontSize="small" />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            router.push(
                              `/manage-products/collections/${collection.id}`
                            )
                          }
                          sx={{ color: "#6366f1" }}
                          title="View Products/Details"
                        >
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(collection)}
                          sx={{ color: canEdit ? "#3b82f6" : "#cbd5e1" }}
                          disabled={!canEdit}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(collection.id)}
                          sx={{ color: canEdit ? "#ef4444" : "#cbd5e1" }}
                          disabled={!canEdit}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCollections}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ borderTop: "1px solid #e2e8f0" }}
        />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px", overflowX: "hidden" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingCollection ? "Edit Collection" : "Create New Collection"}
        </DialogTitle>
        <DialogContent sx={{ overflowX: "hidden" }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-slate-700">
                Collection Name *
              </p>
              <TextField
                placeholder="Collection Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                fullWidth
                autoFocus
                variant="outlined"
                size="small"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold text-slate-700">
                Description
              </p>
              <TextField
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                size="small"
              />
            </div>

            {/* Media Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Icon Upload */}
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-slate-700">
                  Icon
                </p>
                <Box
                  onClick={() => setIconPickerOpen(true)}
                  className="border border-slate-200 rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                  sx={{ width: "100%", height: "140px" }}
                >
                  {formData.icon ? (
                    <img
                      src={formData.icon}
                      alt="Icon Preview"
                      className="h-20 w-20 object-contain rounded"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <ImageIcon fontSize="large" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-blue-600">
                    {formData.icon ? "Change Icon" : "Select Icon"}
                  </span>
                </Box>
              </div>

              {/* Banner Upload */}
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-slate-700">
                  Banner Image
                </p>
                <Box
                  onClick={() => setBannerPickerOpen(true)}
                  className="border border-slate-200 rounded-lg p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                  sx={{ width: "100%", height: "140px" }}
                >
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Banner Preview"
                      className="h-20 w-full object-cover rounded"
                    />
                  ) : (
                    <div className="h-20 w-full bg-slate-100 rounded flex items-center justify-center text-slate-400">
                      <CloudUploadIcon fontSize="large" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-blue-600">
                    {formData.image ? "Change Banner" : "Select Banner"}
                  </span>
                </Box>
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="flex gap-6 pt-2">
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.showInSearchBar}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showInSearchBar: e.target.checked,
                      })
                    }
                  />
                }
                label="Show in Search"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.showInFilterBar}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showInFilterBar: e.target.checked,
                      })
                    }
                  />
                }
                label="Show in Filter"
              />
            </div>

            {/* Collection Type & Rules */}
            <div className="border-t border-slate-200 pt-4">
              <FormControl component="fieldset">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Collection Type
                </p>
                <div className="flex gap-4 mb-4">
                  <Chip
                    label="Manual"
                    onClick={() => setFormData({ ...formData, type: "manual" })}
                    color={formData.type === "manual" ? "primary" : "default"}
                    variant={formData.type === "manual" ? "filled" : "outlined"}
                  />
                  <Chip
                    label="Automatic"
                    onClick={() =>
                      setFormData({ ...formData, type: "automatic" })
                    }
                    color={
                      formData.type === "automatic" ? "secondary" : "default"
                    }
                    variant={
                      formData.type === "automatic" ? "filled" : "outlined"
                    }
                  />
                </div>
              </FormControl>

              {formData.type === "automatic" && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Automatic Rules
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-semibold text-slate-600">
                      Product Tags
                    </p>
                    <Autocomplete
                      multiple
                      options={allTags}
                      getOptionLabel={(option) =>
                        typeof option === "string" ? option : option.name
                      }
                      value={selectedTags}
                      onChange={handleTagsChange}
                      freeSolo={creatingTag}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={
                              typeof option === "string" ? option : option.name
                            }
                            size="small"
                            {...getTagProps({ index })}
                            key={typeof option === "string" ? index : option._id}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="Search or create tags..."
                          size="small"
                          helperText="Type and press Enter to create new tags"
                        />
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-semibold text-slate-600">
                      Product must match
                    </p>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={formData.conditions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            conditions: e.target.value as "all" | "any",
                          })
                        }
                      >
                        <MenuItem value="any">ANY tag (OR)</MenuItem>
                        <MenuItem value="all">ALL tags (AND)</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              )}
            </div>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name}
            sx={{
              bgcolor: "var(--primary)",
              "&:hover": {
                bgcolor: "var(--primary)",
                filter: "brightness(0.9)",
              },
              textTransform: "none",
            }}
          >
            {editingCollection ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Pickers */}
      <MediaPickerModal
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={handleIconSelect}
        title="Select Collection Icon"
      />

      <MediaPickerModal
        open={bannerPickerOpen}
        onClose={() => setBannerPickerOpen(false)}
        onSelect={handleBannerSelect}
        title="Select Collection Banner"
      />
    </div>
  );
}
