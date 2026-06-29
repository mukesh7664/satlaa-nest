"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  TablePagination,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CloudUpload as UploadIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  Public as GlobalIcon,
  Storefront as StoreIcon,
  GridView as GridViewIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Movie as MovieIcon,
  InsertDriveFile as FileIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { uploadApi } from "@/services/upload.api";
import { useInView } from "react-intersection-observer";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { useAppSelector } from "@/store/hooks";

interface MediaFile {
  _id: string;
  name: string;
  alt: string;
  url: string;
  key: string;
  size: number;
  mimeType: string;
  createdAt: string;
  folder: string;
  isGlobal: boolean;
  tags: string[];
  usageType: string;
}

const STORE_FOLDERS = [
  { id: "all", name: "All Media", icon: <GridViewIcon /> },
  { id: "products", name: "Products", icon: <FolderIcon /> },
  { id: "banners", name: "Banners", icon: <FolderIcon /> },
  { id: "pages", name: "Pages", icon: <FolderIcon /> },
  { id: "icons", name: "Icons", icon: <FolderIcon /> },
];



export default function MediaPage() {
  const { themeColors, componentColors } = useAppSelector((state) => state.settings);
  const btnColor = (() => {
    const key = componentColors?.buttonContained || "primary";
    return (themeColors as any)[key] || themeColors.primary || "#3b82f6";
  })();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0); // MUI uses 0-indexed pages
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFolder, setActiveFolder] = useState("all");
  const [mediaType, setMediaType] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadFolder, setUploadFolder] = useState("products");
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [editName, setEditName] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editUsageType, setEditUsageType] = useState("other");
  const [editTagsList, setEditTagsList] = useState<string[]>([]);
  const [newEditTag, setNewEditTag] = useState("");

  const [uploadTags, setUploadTags] = useState("");
  const [uploadTagsList, setUploadTagsList] = useState<string[]>([]);
  const [newUploadTag, setNewUploadTag] = useState("");
  const [uploadUsageType, setUploadUsageType] = useState("other");

  // Confirmation Dialog State
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { subscription, usage, limits, loading: limitsLoading } = usePlanLimits();

  // No longer needed for discrete pagination
  // const { ref, inView } = useInView({
  //   threshold: 0,
  // });

  // Initial fetch and filter reset
  useEffect(() => {
    setPage(0);
    fetchImages(0, true);
  }, [searchTerm, activeFolder, mediaType, rowsPerPage, selectedTags]);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const tags = await uploadApi.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  // No longer switching context, so just ensure upload folder matches folder selection if possible
  useEffect(() => {
    if (activeFolder !== "all") {
      setUploadFolder(activeFolder);
    }
  }, [activeFolder]);

  // Auto-suggest usageType based on uploadFolder
  useEffect(() => {
    if (uploadFolder === "products") setUploadUsageType("product");
    else if (uploadFolder === "banners") setUploadUsageType("banner");
    else if (uploadFolder === "pages") setUploadUsageType("section");
    else if (uploadFolder === "icons") setUploadUsageType("logo");
    else setUploadUsageType("other");
  }, [uploadFolder]);

  // Reset upload state when dialog opens
  useEffect(() => {
    if (uploadOpen) {
      setUploadFile(null);
      setUploadPreview(null);
      setUploadName("");
      setUploadAlt("");
      setUploadTagsList([]);
      setNewUploadTag("");
    }
  }, [uploadOpen]);

  // Infinite scroll logic removed in favor of explicit pagination
  /*
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
      fetchImages(page + 1);
    }
  }, [inView, hasMore, loading]);
  */

  const fetchImages = async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      const response = await uploadApi.listImages(
        pageNum + 1, // Backend uses 1-indexed pages
        rowsPerPage,
        searchTerm,
        mediaType,
        activeFolder === "all" ? undefined : activeFolder,
        false,
        selectedTags
      );

      const newFiles = response.images || [];
      setFiles(newFiles); // In pagination mode, we replace files instead of appending

      setTotal(response.total || 0);
      setHasMore(newFiles.length === rowsPerPage);
    } catch (error: any) {
      console.error("Failed to list images:", error);
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    fetchImages(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);
    // useEffect will trigger fetchImages(0, true)
  };

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
    setIsDeletingMultiple(false);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (isDeletingMultiple) {
      try {
        setLoading(true);
        for (const id of selected) {
          await uploadApi.deleteImage(id);
        }
        toast.success(`${selected.length} files deleted successfully`);
        setFiles((prev) => prev.filter((f) => !selected.includes(f._id)));
        setSelected([]);
      } catch (e) {
        toast.error("Failed to delete some files");
      } finally {
        setLoading(false);
        setConfirmDeleteOpen(false);
      }
    } else if (itemToDelete) {
      try {
        await uploadApi.deleteImage(itemToDelete);
        toast.success("File deleted successfully");
        setFiles((prev) => prev.filter((f) => f._id !== itemToDelete));
        setSelected((prev) => prev.filter((k) => k !== itemToDelete));
        if (editingFile?._id === itemToDelete) setEditOpen(false);
      } catch (e: any) {
        toast.error("Failed to delete file");
      } finally {
        setConfirmDeleteOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      await uploadApi.uploadImage(
        uploadFile,
        uploadFolder,
        uploadName,
        uploadAlt,
        false,
        uploadTagsList,
        uploadUsageType
      );
      toast.success("File uploaded successfully");

      // Refresh current view immediately
      setPage(0);
      fetchImages(0, true);
      fetchTags();

      setUploadOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTagsList([]);
      setNewUploadTag("");
    } catch (error: any) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((k) => k !== id));
    } else {
      setSelected((prev) => [...prev, id]);
    }
  };

  const renderMediaItem = (file: MediaFile) => {
    const isImage = file.mimeType?.startsWith("image/");
    const isVideo = file.mimeType?.startsWith("video/");
    const isSelected = selected.includes(file._id);

    return (
      <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={file._id}>
        <Paper
          elevation={0}
          onClick={() => {
            setEditingFile(file);
            setEditName(file.name);
            setEditAlt(file.alt || "");
            setEditTagsList(file.tags || []);
            setEditUsageType(file.usageType || "other");
            setEditOpen(true);
          }}
          className={`group relative aspect-square rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${isSelected ? "" : "border-slate-200 hover:border-slate-300"}`}
          style={isSelected ? { borderColor: btnColor, backgroundColor: "color-mix(in srgb, var(--primary) 8%, transparent)" } : {}}
        >
          {/* Main Content */}
          <div className="w-full h-full flex items-center justify-center p-1.5 2xl:p-3">
            {isImage ? (
              <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain pointer-events-none" />
            ) : isVideo ? (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <MovieIcon sx={{ fontSize: { xs: 28, '2xl': 48 } }} />
                <Typography variant="caption" className="font-bold text-[9px] 2xl:text-[11px]">VIDEO</Typography>
              </div>
            ) : (
              <FileIcon sx={{ fontSize: { xs: 28, '2xl': 48 }, color: "#94a3b8" }} />
            )}
          </div>

          {/* Overlay for actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

          {/* Selection Badge */}
          <div
            onClick={(e) => handleSelectOne(file._id, e)}
            className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100 border-slate-300"}`}
            style={isSelected ? { borderColor: btnColor, color: btnColor } : {}}
          >
            {isSelected && <CheckCircleIcon sx={{ fontSize: 20, color: btnColor }} />}
          </div>

          {/* Icon overlay for video */}
          {isVideo && (
            <div className="absolute top-2 right-2 p-1 bg-black/50 rounded text-white backdrop-blur-sm">
              <MovieIcon sx={{ fontSize: 16 }} />
            </div>
          )}

          {/* Info footer */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur-sm border-t border-slate-100 transform translate-y-full group-hover:translate-y-0 transition-transform">
            <Typography variant="caption" className="block font-medium truncate text-slate-700">
              {file.name}
            </Typography>
            <Typography variant="caption" className="text-slate-400">
              {formatSize(file.size)}
            </Typography>
          </div>
        </Paper>
      </Grid>
    );
  };

  const renderMediaListItem = (file: MediaFile) => {
    const isImage = file.mimeType?.startsWith("image/");
    const isVideo = file.mimeType?.startsWith("video/");
    const isSelected = selected.includes(file._id);

    return (
      <Box
        key={file._id}
        onClick={() => {
          setEditingFile(file);
          setEditName(file.name);
          setEditAlt(file.alt || "");
          setEditTagsList(file.tags || []);
          setEditUsageType(file.usageType || "other");
          setEditOpen(true);
        }}
        className={`flex items-center gap-3 2xl:gap-6 p-2 2xl:p-4 rounded-xl border-2 mb-2 transition-all cursor-pointer ${isSelected ? "" : "border-transparent hover:bg-slate-50"}`}
        style={isSelected ? { borderColor: btnColor, backgroundColor: "color-mix(in srgb, var(--primary) 8%, transparent)" } : {}}
      >
        <div
          onClick={(e) => handleSelectOne(file._id, e)}
          className={`w-5 h-5 2xl:w-7 2xl:h-7 rounded-full border-2 bg-white flex items-center justify-center transition-opacity shrink-0 ${isSelected ? "" : "border-slate-300"}`}
          style={isSelected ? { borderColor: btnColor, color: btnColor } : {}}
        >
          {isSelected && <CheckCircleIcon sx={{ fontSize: { xs: 16, '2xl': 22 }, color: btnColor }} />}
        </div>

        <div className="w-10 h-10 2xl:w-16 2xl:h-16 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
          {isImage ? (
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
          ) : isVideo ? (
            <MovieIcon sx={{ fontSize: { xs: 20, '2xl': 28 } }} className="text-slate-400" />
          ) : (
            <FileIcon sx={{ fontSize: { xs: 20, '2xl': 28 } }} className="text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 md:grid md:grid-cols-4 md:gap-4 items-center">
          <div className="col-span-2">
            <Typography variant="body2" className="font-bold truncate text-slate-700" sx={{ fontSize: { xs: 12, '2xl': 14 } }}>{file.name}</Typography>
            <Typography variant="caption" className="text-slate-400 md:hidden" sx={{ fontSize: 10 }}>{formatSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}</Typography>
          </div>
          <Typography variant="caption" className="text-slate-500 hidden md:block text-left" sx={{ fontSize: { xs: 11, '2xl': 13 } }}>{file.mimeType}</Typography>
          <Typography variant="caption" className="text-slate-500 hidden md:block text-left" sx={{ fontSize: { xs: 11, '2xl': 13 } }}>{formatSize(file.size)}</Typography>
        </div>

        <Typography variant="caption" className="text-slate-400 hidden lg:block w-32 text-right" sx={{ fontSize: { xs: 11, '2xl': 13 } }}>
          {new Date(file.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
    );
  };

  return (
    <Box className="flex min-h-[calc(100vh-4.5rem)] bg-slate-50/30">
      {/* Sidebar - Folders */}
      <Box className="w-52 2xl:w-72 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 2xl:p-6 pb-2">
          <Typography variant="h6" className="font-bold text-slate-800 flex items-center gap-2" sx={{ fontSize: { xs: '1rem', '2xl': '1.25rem' } }}>
            <FileIcon className="transition-colors" sx={{ fontSize: { xs: 20, '2xl': 24 }, color: btnColor }} /> Media Library
          </Typography>
        </div>

        <Divider className="mb-4" />

        <List className="px-3 flex-1 overflow-y-auto">
          {STORE_FOLDERS.map((folder) => (
            <ListItem key={folder.id} disablePadding className="mb-1">
              <ListItemButton
                selected={activeFolder === folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className="rounded-lg"
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "color-mix(in srgb, var(--primary) 10%, transparent) !important",
                    color: "var(--primary) !important",
                    "&:hover": { bgcolor: "color-mix(in srgb, var(--primary) 20%, transparent) !important" },
                    "& .MuiListItemIcon-root": { color: "var(--primary) !important" },
                  },
                }}
              >
                <ListItemIcon className="min-w-[40px] text-slate-500">
                  {folder.icon}
                </ListItemIcon>
                <ListItemText
                  primary={folder.name}
                  primaryTypographyProps={{ className: "text-sm font-medium" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />
        <div className="p-3 2xl:p-6">
          <Button
            fullWidth
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setUploadOpen(true)}
            size="small"
            sx={{
              borderRadius: "10px",
              py: { xs: 1, '2xl': 1.5 },
              textTransform: "none",
              boxShadow: "none",
              fontWeight: 700,
              fontSize: { xs: 12, '2xl': 14 },
              bgcolor: btnColor,
              "&:hover": { bgcolor: btnColor, filter: "brightness(0.9)" },
            }}
          >
            Upload Media
          </Button>

          {subscription && (
            <Box className="mt-4 2xl:mt-8 p-3 2xl:p-5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <Typography variant="caption" className="font-bold text-slate-500 text-[10px] 2xl:text-[12px]">STORAGE USAGE</Typography>
                <Typography variant="caption" className="font-bold text-slate-700 text-[10px] 2xl:text-[12px]">
                  {usage?.storage?.used || 0} MB / {usage?.storage?.limit || limits.storageMb} MB
                </Typography>
              </div>
              <Typography variant="caption" className="text-[10px] 2xl:text-[11px] text-slate-400 mt-2 block leading-tight">
                Plan: {subscription.plan?.name}
              </Typography>
            </Box>
          )}
        </div>

      </Box>

      {/* Main Content */}
      <Box className="flex-1 flex flex-col">
        {/* Header / Search */}
        <header className="h-14 2xl:h-20 bg-white border-b border-slate-200 px-4 2xl:px-10 flex items-center justify-between z-10 sticky top-0">
          <div className="flex-1 max-w-md 2xl:max-w-2xl">
            <TextField
              placeholder="Search images, videos, documents..."
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-slate-400" sx={{ fontSize: { xs: 18, '2xl': 22 } }} />
                  </InputAdornment>
                ),
                className: "bg-slate-50 border-none rounded-lg",
                sx: { fontSize: { xs: 12, '2xl': 14 }, height: { xs: 36, '2xl': 44 } }
              }}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <Typography variant="body2" className="text-slate-500 font-medium" sx={{ fontSize: { xs: 11, '2xl': 14 } }}>
              Total: {total} files
            </Typography>
            {selected.length > 0 && (
              <Box className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  size="small"
                  className="rounded-lg text-slate-500 border-slate-200"
                  onClick={() => setSelected([])}
                >
                  Deselect All
                </Button>
                <Button
                  color="error"
                  variant="contained"
                  size="small"
                  startIcon={<DeleteIcon />}
                  sx={{ borderRadius: "8px", boxShadow: "none" }}
                  onClick={() => {
                    setIsDeletingMultiple(true);
                    setConfirmDeleteOpen(true);
                  }}
                >
                  Delete ({selected.length})
                </Button>
              </Box>
            )}
          </div>
        </header>

        {/* Content Area */}
        <Box className="flex-1 p-4 2xl:p-10">
          <Box className="mb-4 2xl:mb-8 flex justify-between items-center">
            <Typography variant="subtitle1" className="font-bold text-slate-700" sx={{ fontSize: { xs: '0.9rem', '2xl': '1.1rem' } }}>
              Store Assets — {activeFolder === "all" ? "All Files" : STORE_FOLDERS.find(f => f.id === activeFolder)?.name}
            </Typography>

            <div className="flex items-center gap-4">
              <Tabs
                value={mediaType}
                onChange={(e, v) => setMediaType(v)}
                sx={{
                  minHeight: { xs: '32px', '2xl': '40px' },
                  '& .MuiTab-root': {
                    minHeight: { xs: '32px', '2xl': '40px' },
                    textTransform: 'none',
                    fontSize: { xs: '12px', '2xl': '14px' },
                    fontWeight: 600,
                    px: { xs: 1.5, '2xl': 3 },
                    borderRadius: '8px',
                    '&.Mui-selected': { color: 'var(--primary)' }
                  },
                  '& .MuiTabs-indicator': {
                    height: '2px',
                    bgcolor: 'var(--primary)',
                    borderRadius: '2px'
                  }
                }}
              >
                <Tab value="all" label="All Assets" />
                <Tab value="image" label="Images" />
                <Tab value="audio" label="Audio" />
                <Tab value="video" label="Video" />
              </Tabs>

              <div className="flex items-center gap-1">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mr-2">
                  <IconButton
                    size="small"
                    onClick={() => setViewMode("grid")}
                    sx={{
                      borderRadius: '6px',
                      bgcolor: viewMode === 'grid' ? 'white' : 'transparent',
                      color: viewMode === 'grid' ? 'var(--primary)' : '#64748b',
                      boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      '&:hover': { bgcolor: viewMode === 'grid' ? 'white' : 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <GridIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setViewMode("list")}
                    sx={{
                      borderRadius: '6px',
                      bgcolor: viewMode === 'list' ? 'white' : 'transparent',
                      color: viewMode === 'list' ? 'var(--primary)' : '#64748b',
                      boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      '&:hover': { bgcolor: viewMode === 'list' ? 'white' : 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <ListIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </div>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<FilterIcon />}
                  style={{ color: selectedTags.length > 0 ? btnColor : undefined, fontWeight: selectedTags.length > 0 ? 'bold' : 'normal' }}
                  className={selectedTags.length > 0 ? "" : "text-slate-500"}
                  onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                >
                  Filter {selectedTags.length > 0 && `(${selectedTags.length})`}
                </Button>
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={() => setFilterAnchorEl(null)}
                  PaperProps={{
                    sx: { p: 1, minWidth: 200, maxHeight: 300, borderRadius: '12px' }
                  }}
                >
                  <Typography variant="caption" className="px-3 py-1 font-bold text-slate-400 block border-b mb-1">
                    FILTER BY TAGS
                  </Typography>
                  {availableTags.length === 0 ? (
                    <Typography variant="caption" className="px-3 py-4 text-center block text-slate-400">
                      No tags available
                    </Typography>
                  ) : (
                    <>
                      {availableTags.map((tag) => (
                        <MenuItem key={tag} disableGutters className="px-1 py-0 hover:bg-transparent">
                          <FormControlLabel
                            className="w-full ml-0 mr-0 px-2 rounded-lg hover:bg-slate-50"
                            control={
                              <Checkbox
                                size="small"
                                checked={selectedTags.includes(tag)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTags([...selectedTags, tag]);
                                  } else {
                                    setSelectedTags(selectedTags.filter(t => t !== tag));
                                  }
                                }}
                              />
                            }
                            label={<Typography variant="body2">{tag}</Typography>}
                          />
                        </MenuItem>
                      ))}
                      {selectedTags.length > 0 && (
                        <Box className="mt-1 pt-1 border-t flex justify-end">
                          <Button
                            size="small"
                            onClick={() => setSelectedTags([])}
                            className="text-[10px] text-blue-600 font-bold lowercase"
                          >
                            Clear all
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </Menu>
              </div>
            </div>
          </Box>

          {/* Grid / List View */}
          {viewMode === "grid" ? (
            <Grid container spacing={3}>
              {files.map(renderMediaItem)}
            </Grid>
          ) : (
            <Box>
              <Box className="hidden md:flex items-center gap-4 px-3 mb-2 opacity-50">
                <Box className="w-6 shrink-0" /> {/* checkbox spacing */}
                <Box className="w-12 shrink-0" /> {/* thumb spacing */}
                <Box className="flex-1 md:grid md:grid-cols-4 md:gap-4 items-center">
                  <Typography variant="caption" className="col-span-2 font-bold uppercase text-left">Name</Typography>
                  <Typography variant="caption" className="font-bold uppercase text-left">Type</Typography>
                  <Typography variant="caption" className="font-bold uppercase text-left">Size</Typography>
                </Box>
                <Box className="hidden lg:block w-32" /> {/* Date column spacing */}
              </Box>
              {files.map(renderMediaListItem)}
            </Box>
          )}

          {loading && (
            <Box className="py-8 flex justify-center">
              <CircularProgress size={24} />
            </Box>
          )}

          <Box className="mt-8 border-t border-slate-200 bg-white rounded-xl">
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50, 100]}
            />
          </Box>

          {!loading && files.length === 0 && (
            <Box className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FolderIcon sx={{ fontSize: 64, mb: 2, opacity: 0.2 }} />
              <Typography variant="h6">No files found in this folder</Typography>
              <Typography variant="body2">Try different search or upload something!</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="font-bold">Upload New Media</DialogTitle>
        <DialogContent dividers>
          <Box className="pt-2 flex flex-col gap-4">
            {!uploadFile ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all relative">
                <UploadIcon sx={{ fontSize: 56, color: "#94a3b8", mb: 2 }} />
                <Typography className="text-slate-700 font-bold">Click to browse or Drag & Drop</Typography>
                <Typography variant="caption" className="text-slate-400">Supported: JPG, PNG, WEBP, MP4, GIF</Typography>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const f = e.target.files[0];
                    setUploadFile(f);
                    setUploadPreview(URL.createObjectURL(f));
                    setUploadName(f.name.split('.')[0]);
                  }
                }} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-lg border flex items-center justify-center overflow-hidden">
                    {uploadFile.type.startsWith('image/') ? (
                      <img src={uploadPreview!} alt="preview" className="object-contain w-full h-full" />
                    ) : (
                      <MovieIcon className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Typography className="font-bold truncate" variant="body2">{uploadFile.name}</Typography>
                    <Typography variant="caption" className="text-slate-400">{formatSize(uploadFile.size)}</Typography>
                    <Button size="small" color="error" className="block mt-1 p-0 h-auto min-w-0" onClick={() => setUploadFile(null)}>Change</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TextField label="Name" fullWidth size="small" value={uploadName} onChange={(e) => setUploadName(e.target.value)} />
                  <TextField
                    select
                    label="Folder"
                    fullWidth
                    size="small"
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    {STORE_FOLDERS.filter(f => f.id !== 'all').map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </TextField>
                </div>
                <TextField label="Alt Text" fullWidth size="small" multiline rows={2} value={uploadAlt} onChange={(e) => setUploadAlt(e.target.value)} placeholder="Describe the image for SEO..." sx={{ mt: 1 }} />

                <Box className="flex flex-col gap-2 mt-2">
                  <Typography variant="caption" className="text-slate-500 font-bold">TAGS</Typography>
                  <Box className="flex gap-2">
                    <TextField
                      placeholder="Add tag..."
                      fullWidth
                      size="small"
                      value={newUploadTag}
                      onChange={(e) => setNewUploadTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newUploadTag.trim() && !uploadTagsList.includes(newUploadTag.trim())) {
                            setUploadTagsList(prev => [...prev, newUploadTag.trim()]);
                            setNewUploadTag("");
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        if (newUploadTag.trim() && !uploadTagsList.includes(newUploadTag.trim())) {
                          setUploadTagsList(prev => [...prev, newUploadTag.trim()]);
                          setNewUploadTag("");
                        }
                      }}
                      sx={{ borderRadius: "8px", minWidth: '70px' }}
                    >
                      ADD
                    </Button>
                  </Box>
                  <Box className="flex flex-wrap gap-1 mt-1">
                    {uploadTagsList.map(tag => (
                      <Badge
                        key={tag}
                        badgeContent={<CloseIcon sx={{ fontSize: 10 }} onClick={() => setUploadTagsList(prev => prev.filter(t => t !== tag))} />}
                        sx={{ "& .MuiBadge-badge": { cursor: 'pointer', bgcolor: '#ef4444', color: 'white', height: 14, minWidth: 14, p: 0 } }}
                      >
                        <Typography variant="caption" className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                          {tag}
                        </Typography>
                      </Badge>
                    ))}
                  </Box>
                </Box>

                <TextField
                  select
                  label="Usage Type"
                  fullWidth
                  size="small"
                  value={uploadUsageType}
                  onChange={(e) => setUploadUsageType(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ mt: 2 }}
                >
                  <option value="product">Product</option>
                  <option value="banner">Banner</option>
                  <option value="section">Section</option>
                  <option value="logo">Logo</option>
                  <option value="other">Other</option>
                </TextField>
              </div>
            )}
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setUploadOpen(false)} className="text-slate-500">Cancel</Button>
          <Button
            variant="contained"
            disabled={!uploadFile || uploading}
            onClick={handleUploadSubmit}
            sx={{ borderRadius: "8px", px: 4, boxShadow: "none" }}
          >
            {uploading ? <CircularProgress size={20} className="mr-2" color="inherit" /> : null}
            {uploading ? "Uploading..." : "Start Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <span className="font-bold">Media Details</span>
          <Box className="flex gap-2">
            <Tooltip title="Copy Public URL">
              <IconButton size="small" onClick={() => {
                navigator.clipboard.writeText(editingFile?.url || "");
                toast.success("URL copied!");
              }}><CopyIcon fontSize="small" /></IconButton>
            </Tooltip>
            <IconButton size="small" color="error" onClick={() => editingFile && handleDelete(editingFile._id)}><DeleteIcon fontSize="small" /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <div className="flex flex-col gap-6 pt-2">
            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative">
              {editingFile?.mimeType.startsWith('image/') ? (
                <img src={editingFile.url} className="max-w-full max-h-full object-contain" alt="" />
              ) : (
                <video src={editingFile?.url} controls className="w-full h-full" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Box>
                <Typography variant="caption" className="text-slate-400 block mb-1">FILE NAME</Typography>
                <Typography variant="body2" className="font-bold truncate">{editingFile?.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-slate-400 block mb-1">MIME TYPE</Typography>
                <Typography variant="body2" className="font-bold">{editingFile?.mimeType}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-slate-400 block mb-1">SIZE</Typography>
                <Typography variant="body2" className="font-bold">{editingFile ? formatSize(editingFile.size) : '0 B'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="text-slate-400 block mb-1">DATE UPLOADED</Typography>
                <Typography variant="body2" className="font-bold">{editingFile ? new Date(editingFile.createdAt).toLocaleDateString() : '-'}</Typography>
              </Box>
            </div>

            <Divider />

            <div className="space-y-6">
              <TextField label="Display Name" fullWidth size="small" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <TextField label="Alt Text (SEO)" fullWidth size="small" value={editAlt} multiline rows={2} onChange={(e) => setEditAlt(e.target.value)} />

              <Box className="flex flex-col gap-2">
                <Typography variant="caption" className="text-slate-500 font-bold">TAGS</Typography>
                <Box className="flex gap-2">
                  <TextField
                    placeholder="Add tag..."
                    fullWidth
                    size="small"
                    value={newEditTag}
                    onChange={(e) => setNewEditTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newEditTag.trim() && !editTagsList.includes(newEditTag.trim())) {
                          setEditTagsList(prev => [...prev, newEditTag.trim()]);
                          setNewEditTag("");
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      if (newEditTag.trim() && !editTagsList.includes(newEditTag.trim())) {
                        setEditTagsList(prev => [...prev, newEditTag.trim()]);
                        setNewEditTag("");
                      }
                    }}
                    sx={{ borderRadius: "8px", minWidth: '70px' }}
                  >
                    ADD
                  </Button>
                </Box>
                <Box className="flex flex-wrap gap-1 mt-1">
                  {editTagsList.map(tag => (
                    <Badge
                      key={tag}
                      badgeContent={<CloseIcon sx={{ fontSize: 10 }} onClick={() => setEditTagsList(prev => prev.filter(t => t !== tag))} />}
                      sx={{ "& .MuiBadge-badge": { cursor: 'pointer', bgcolor: '#ef4444', color: 'white', height: 14, minWidth: 14, p: 0 } }}
                    >
                      <Typography variant="caption" className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                        {tag}
                      </Typography>
                    </Badge>
                  ))}
                </Box>
              </Box>

              <TextField
                select
                label="Usage Type"
                fullWidth
                size="small"
                variant="outlined"
                value={editUsageType}
                onChange={(e) => setEditUsageType(e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value="product">Product</option>
                <option value="banner">Banner</option>
                <option value="section">Section</option>
                <option value="logo">Logo</option>
                <option value="other">Other</option>
              </TextField>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setEditOpen(false)}>Close</Button>
          <Button variant="contained" sx={{ borderRadius: "8px", boxShadow: "none" }} onClick={async () => {
            if (editingFile) {
              await uploadApi.updateMedia(editingFile._id, {
                name: editName,
                alt: editAlt,
                tags: editTagsList,
                usageType: editUsageType
              });
              toast.success("Updated!");
              fetchTags(); // Refresh tags
              setFiles(prev => prev.map(f => f._id === editingFile._id ? {
                ...f,
                name: editName,
                alt: editAlt,
                tags: editTagsList,
                usageType: editUsageType
              } : f));
              setEditOpen(false);
            }
          }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle className="font-bold">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            {isDeletingMultiple
              ? `Are you sure you want to delete ${selected.length} files permanently?`
              : "Are you sure you want to delete this file permanently?"
            }
          </Typography>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setConfirmDeleteOpen(false)} className="text-slate-500">Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete} sx={{ borderRadius: "8px", boxShadow: "none" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
