"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  TablePagination,
  Badge,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Folder as FolderIcon,
  Public as GlobalIcon,
  Storefront as StoreIcon,
  GridView as GridViewIcon,
  Movie as MovieIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  CloudUpload as UploadIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { uploadApi } from "@/services/upload.api";

interface MediaFile {
  _id: string;
  id?: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaFile) => void;
  title?: string;
  type?: string; // 'image', 'video', etc
  isGlobal?: boolean;
}

const STORE_FOLDERS = [
  { id: "all", name: "All", icon: <GridViewIcon fontSize="small" /> },
  { id: "products", name: "Products", icon: <FolderIcon fontSize="small" /> },
  { id: "banners", name: "Banners", icon: <FolderIcon fontSize="small" /> },
  { id: "pages", name: "Pages", icon: <FolderIcon fontSize="small" /> },
  { id: "icons", name: "Icons", icon: <FolderIcon fontSize="small" /> },
];



export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
  title = "Select Media",
  type = "all",
  isGlobal = false,
}: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFolder, setActiveFolder] = useState("all");
  const [mediaType, setMediaType] = useState(type || "all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const [page, setPage] = useState(0); // MUI uses 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadTagsList, setUploadTagsList] = useState<string[]>([]);
  const [newUploadTag, setNewUploadTag] = useState("");
  const [uploadUsageType, setUploadUsageType] = useState("other");
  const [uploadFolder, setUploadFolder] = useState("products");
  const [uploading, setUploading] = useState(false);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // No longer needed for discrete pagination
  // const { ref, inView } = useInView();

  useEffect(() => {
    if (open) {
      setPage(0);
      fetchImages(0, true);
      fetchTags();
      // Reset upload state when modal opens
      setUploadOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadName("");
      setUploadAlt("");
      setUploadTagsList([]);
      setNewUploadTag("");
    }
  }, [open, searchTerm, activeFolder, rowsPerPage, mediaType, selectedTags]);

  const fetchTags = async () => {
    try {
      const tags = await uploadApi.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  // Infinite scroll removed for TablePagination consistency
  /*
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((p) => p + 1);
      fetchImages(page + 1);
    }
  }, [inView, hasMore, loading]);
  */



  useEffect(() => {
    if (activeFolder !== "all") {
      setUploadFolder(activeFolder);
    }
  }, [activeFolder]);

  useEffect(() => {
    if (uploadFolder === "products") setUploadUsageType("product");
    else if (uploadFolder === "banners") setUploadUsageType("banner");
    else if (uploadFolder === "pages") setUploadUsageType("section");
    else if (uploadFolder === "icons") setUploadUsageType("logo");
    else setUploadUsageType("other");
  }, [uploadFolder]);

  const fetchImages = async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      const res = await uploadApi.listImages(
        pageNum + 1, // backend is 1-indexed
        rowsPerPage,
        searchTerm,
        mediaType,
        activeFolder === "all" ? undefined : activeFolder,
        isGlobal,
        selectedTags
      );

      const items = res.images || [];
      setFiles(items); // In pagination mode, we replace files

      setTotal(res.total || 0);
      setHasMore(items.length === rowsPerPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    fetchImages(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(
        uploadFile, 
        uploadFolder, 
        uploadName, 
        uploadAlt, 
        isGlobal,
        uploadTagsList,
        uploadUsageType
      );
      toast.success("File uploaded successfully");
      onSelect(res); // Automatically select the new upload
      onClose();
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle className="flex justify-between items-center bg-white border-b border-slate-100">
        <Typography variant="h6" className="font-bold">{title}</Typography>
        <Box className="flex items-center gap-2">
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<UploadIcon />}
            onClick={() => setUploadOpen(true)}
            sx={{ borderRadius: "8px", boxShadow: "none", textTransform: 'none' }}
          >
            Upload
          </Button>
          <Button size="small" onClick={onClose} className="min-w-0 p-1 text-slate-400">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent className="p-0 flex h-[600px]">
        {/* Sidebar */}
        <Box className="w-60 border-r border-slate-100 flex flex-col pt-4">

          
          <List className="mt-2 px-2">
            {STORE_FOLDERS.map((f: any) => (
              <ListItem key={f.id} disablePadding className="mb-1">
                <ListItemButton
                  selected={activeFolder === f.id}
                  onClick={() => setActiveFolder(f.id)}
                  className="rounded-lg h-10"
                  sx={{
                    "&.Mui-selected": { bgcolor: "blue.50", color: "blue.600" }
                  }}
                >
                  <ListItemIcon className="min-w-[32px]">{f.icon}</ListItemIcon>
                  <ListItemText primary={f.name} primaryTypographyProps={{ className: "text-sm font-medium" }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Content */}
        <Box className="flex-1 flex flex-col bg-slate-50">
          <Box className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
            <TextField
              size="small"
              placeholder="Search media..."
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-slate-400" fontSize="small" />
                  </InputAdornment>
                ),
                className: "bg-slate-50 border-none rounded-lg text-sm",
              }}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />

            <div className="flex items-center gap-4 shrink-0">
              <Tabs 
                value={mediaType} 
              onChange={(e: React.SyntheticEvent, v: string) => setMediaType(v)}
                sx={{
                  minHeight: '32px',
                  '& .MuiTab-root': {
                    minHeight: '32px',
                    textTransform: 'none',
                    fontSize: '12px',
                    fontWeight: 500,
                    px: 1,
                    minWidth: 'auto',
                    borderRadius: '6px',
                    '&.Mui-selected': { color: '#2563eb' }
                  },
                  '& .MuiTabs-indicator': { 
                    height: '2px',
                    bgcolor: '#2563eb',
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
                <Button 
                  size="small" 
                  variant="text" 
                  startIcon={<FilterIcon sx={{ fontSize: 16 }} />} 
                  className={selectedTags.length > 0 ? "text-blue-600 font-bold" : "text-slate-500"}
                  onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                  sx={{ textTransform: 'none', fontSize: '12px' }}
                >
                  Filter {selectedTags.length > 0 && `(${selectedTags.length})`}
                </Button>
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={() => setFilterAnchorEl(null)}
                  PaperProps={{
                    sx: { p: 1, minWidth: 160, maxHeight: 250, borderRadius: '8px' }
                  }}
                >
                  <Typography variant="caption" className="px-3 py-1 font-bold text-slate-400 block border-b mb-1">
                    FILTER BY TAGS
                  </Typography>
                  {availableTags.length === 0 ? (
                    <Typography variant="caption" className="px-3 py-4 text-center block text-slate-400">
                      No tags
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  if (e.target.checked) {
                                    setSelectedTags([...selectedTags, tag]);
                                  } else {
                                    setSelectedTags(selectedTags.filter(t => t !== tag));
                                  }
                                }}
                              />
                            }
                            label={<Typography variant="body2" sx={{ fontSize: '13px' }}>{tag}</Typography>}
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

                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg ml-2">
                  <IconButton 
                    size="small" 
                    onClick={() => setViewMode("grid")}
                    sx={{ 
                      borderRadius: '4px',
                      bgcolor: viewMode === 'grid' ? 'white' : 'transparent',
                      color: viewMode === 'grid' ? '#2563eb' : '#64748b',
                      p: 0.5,
                      '&:hover': { bgcolor: viewMode === 'grid' ? 'white' : 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <GridIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => setViewMode("list")}
                    sx={{ 
                      borderRadius: '4px',
                      bgcolor: viewMode === 'list' ? 'white' : 'transparent',
                      color: viewMode === 'list' ? '#2563eb' : '#64748b',
                      p: 0.5,
                      '&:hover': { bgcolor: viewMode === 'list' ? 'white' : 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <ListIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </div>
              </div>
            </div>
          </Box>

          <Box className="flex-1 overflow-y-auto p-4">
            {viewMode === "grid" ? (
              <Grid container spacing={2}>
                {files.map((file) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={file._id || file.id}>
                    <Paper
                      elevation={0}
                      onClick={() => {
                        onSelect(file);
                        onClose();
                      }}
                      className="aspect-square border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group relative bg-white"
                    >
                      <div className="w-full h-full p-2 flex items-center justify-center">
                        {file.mimeType?.startsWith("image/") ? (
                          <img src={file.url} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            {file.mimeType?.startsWith("video/") ? <MovieIcon /> : <FileIcon />}
                            <Typography variant="caption" className="font-bold">FILE</Typography>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-white/90 backdrop-blur-sm border-t border-slate-100 text-[10px] truncate">
                        {file.name}
                      </div>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box>
                {files.map((file) => (
                  <Box 
                    key={file._id || file.id}
                    onClick={() => {
                      onSelect(file);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all cursor-pointer mb-1 bg-white/50"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center overflow-hidden shrink-0">
                      {file.mimeType?.startsWith("image/") ? (
                        <img src={file.url} className="w-full h-full object-cover" />
                      ) : (
                        <FileIcon className="text-slate-400" fontSize="small" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Typography variant="body2" className="font-medium truncate text-slate-700">{file.name}</Typography>
                      <Typography variant="caption" className="text-slate-400 block">{file.mimeType}</Typography>
                    </div>
                  </Box>
                ))}
              </Box>
            )}

            {loading && (
              <Box className="flex justify-center py-4">
                <CircularProgress size={20} />
              </Box>
            )}

            <Box className="mt-4 border-t border-slate-100 bg-white">
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50, 100]}
                sx={{
                  "& .MuiTablePagination-toolbar": {
                    minHeight: 48,
                  },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-input": {
                    fontSize: "0.75rem",
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions className="px-6 py-3 border-t border-slate-100">
        <Button onClick={onClose} color="inherit" className="font-semibold text-slate-500">Cancel</Button>
      </DialogActions>

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
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="caption" className="text-slate-500 font-bold">NAME</Typography>
                    <TextField fullWidth size="small" value={uploadName} onChange={(e) => setUploadName(e.target.value)} />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="caption" className="text-slate-500 font-bold">FOLDER</Typography>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                    >
                      {STORE_FOLDERS.filter(f => f.id !== 'all').map(f => (
                        <MenuItem key={f.id} value={f.id}>
                          {f.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </div>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 1 }}>
                  <Typography variant="caption" className="text-slate-500 font-bold">ALT TEXT</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                    placeholder="Describe the image for SEO..."
                  />
                </Box>
                
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

                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 2 }}>
                  <Typography variant="caption" className="text-slate-500 font-bold">USAGE TYPE</Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={uploadUsageType}
                    onChange={(e) => setUploadUsageType(e.target.value)}
                  >
                    <MenuItem value="product">Product</MenuItem>
                    <MenuItem value="banner">Banner</MenuItem>
                    <MenuItem value="section">Section</MenuItem>
                    <MenuItem value="logo">Logo</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Box>
              </div>
            )}
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setUploadOpen(false)} className="text-slate-500">Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUploadSubmit}
            disabled={!uploadFile || uploading}
            sx={{ borderRadius: "8px", boxShadow: "none", px: 4 }}
          >
            {uploading ? "Uploading..." : "Start Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

