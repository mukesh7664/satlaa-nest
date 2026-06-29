"use client";

import React, { useState, useEffect, useRef } from "react";
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
  TablePagination,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CloudUpload as UploadIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  GridView as GridViewIcon,
  Movie as MovieIcon,
  InsertDriveFile as FileIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { uploadApi } from "@/services/upload.api";
import { useInView } from "react-intersection-observer";

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

const GLOBAL_FOLDERS = [
  { id: "all", name: "All Global Assets", icon: <GridViewIcon /> },
  { id: "icons", name: "Icons", icon: <FolderIcon /> },
  { id: "themes", name: "Themes", icon: <FolderIcon /> },
  { id: "defaults", name: "Defaults", icon: <FolderIcon /> },
  { id: "templates", name: "Templates", icon: <FolderIcon /> },
  { id: "sections", name: "Sections", icon: <FolderIcon /> },
  { id: "branding", name: "Branding", icon: <FolderIcon /> },
  { id: "banners", name: "Banners", icon: <FolderIcon /> },
];

export default function GlobalMediaPage() {
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

  const [selected, setSelected] = useState<string[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadFolder, setUploadFolder] = useState("icons");
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [editName, setEditName] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editUsageType, setEditUsageType] = useState("other");

  const [uploadTags, setUploadTags] = useState("");
  const [uploadUsageType, setUploadUsageType] = useState("other");

  // Confirmation Dialog State
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // No longer needed for discrete pagination
  // const { ref, inView } = useInView({
  //   threshold: 0,
  // });

  // Initial fetch and filter reset
  useEffect(() => {
    setPage(0);
    fetchImages(0, true);
  }, [searchTerm, activeFolder, mediaType, rowsPerPage]);

  // Infinite scroll logic removed in favor of explicit pagination
  /*
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
      fetchImages(page + 1);
    }
  }, [inView, hasMore, loading]);
  */

  // Reset upload state when dialog opens
  useEffect(() => {
    if (uploadOpen) {
      setUploadFile(null);
      setUploadPreview(null);
      setUploadName("");
      setUploadAlt("");
      setUploadTags("");
    }
  }, [uploadOpen]);

  const fetchImages = async (pageNum: number, reset: boolean = false) => {
    try {
      setLoading(true);
      const response = await uploadApi.listImages(
        pageNum + 1, // Backend uses 1-indexed pages
        rowsPerPage,
        searchTerm,
        mediaType,
        activeFolder === "all" ? undefined : activeFolder,
        true // isGlobal is always true for this page
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
        toast.success(`${selected.length} global assets deleted successfully`);
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
        toast.success("Global asset deleted successfully");
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
        true,
        uploadTags.split(",").map(t => t.trim()).filter(Boolean),
        uploadUsageType
      );
      toast.success("Global asset uploaded successfully");
      
      setPage(0);
      fetchImages(0, true);
      
      setUploadOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
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
            setEditTags(file.tags?.join(", ") || "");
            setEditUsageType(file.usageType || "other");
            setEditOpen(true);
          }}
          className={`group relative aspect-square rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
            isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
          }`}
        >
          <div className="w-full h-full flex items-center justify-center p-2">
            {isImage ? (
              <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain pointer-events-none" />
            ) : isVideo ? (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <MovieIcon sx={{ fontSize: 40 }} />
                <Typography variant="caption" className="font-semibold">VIDEO</Typography>
              </div>
            ) : (
              <FileIcon sx={{ fontSize: 40, color: "#94a3b8" }} />
            )}
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

          <div 
            onClick={(e) => handleSelectOne(file._id, e)}
            className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-opacity ${
              isSelected ? "opacity-100 border-blue-500 text-blue-500" : "opacity-0 group-hover:opacity-100 border-slate-300"
            }`}
          >
            {isSelected && <CheckCircleIcon sx={{ fontSize: 20 }} />}
          </div>

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
          setEditTags(file.tags?.join(", ") || "");
          setEditUsageType(file.usageType || "other");
          setEditOpen(true);
        }}
        className={`flex items-center gap-4 p-3 rounded-xl border-2 mb-2 transition-all cursor-pointer ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-transparent hover:bg-slate-50"
        }`}
      >
        <div 
          onClick={(e) => handleSelectOne(file._id, e)}
          className={`w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-opacity shrink-0 ${
            isSelected ? "border-blue-500 text-blue-500" : "border-slate-300"
          }`}
        >
          {isSelected && <CheckCircleIcon sx={{ fontSize: 20 }} />}
        </div>

        <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
          {isImage ? (
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
          ) : isVideo ? (
            <MovieIcon className="text-slate-400" />
          ) : (
            <FileIcon className="text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 md:grid md:grid-cols-4 md:gap-4 items-center">
          <div className="col-span-2">
            <Typography variant="body2" className="font-semibold truncate text-slate-700">{file.name}</Typography>
            <Typography variant="caption" className="text-slate-400 md:hidden">{formatSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}</Typography>
          </div>
          <Typography variant="caption" className="text-slate-500 hidden md:block text-left">{file.mimeType}</Typography>
          <Typography variant="caption" className="text-slate-500 hidden md:block text-left">{formatSize(file.size)}</Typography>
        </div>

        <Typography variant="caption" className="text-slate-400 hidden lg:block w-32 text-right">
          {new Date(file.createdAt).toLocaleDateString()}
        </Typography>
      </Box>
    );
  };

  return (
    <Box className="flex h-[calc(100vh-60px)] 2xl:h-[calc(100vh-72px)] bg-[#F8FAFC]">
      {/* Sidebar - Folders */}
      <Box className="w-64 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-6">
          <Typography variant="h6" className="font-bold text-slate-800 flex items-center gap-2">
            <UploadIcon className="text-blue-500" /> Global Assets
          </Typography>
        </div>

        <List className="px-3 flex-1 overflow-y-auto">
          {GLOBAL_FOLDERS.map((folder) => (
            <ListItem key={folder.id} disablePadding className="mb-1">
              <ListItemButton
                selected={activeFolder === folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className="rounded-lg"
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "rgb(239, 246, 255)",
                    color: "rgb(37, 99, 235)",
                    "&:hover": { bgcolor: "rgb(219, 234, 254)" },
                    "& .MuiListItemIcon-root": { color: "rgb(37, 99, 235)" },
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
        <div className="p-4">
          <Button
            fullWidth
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setUploadOpen(true)}
            sx={{
              borderRadius: "10px",
              py: 1,
              textTransform: "none",
              boxShadow: "none",
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            }}
          >
            Upload Global Asset
          </Button>
        </div>
      </Box>

      {/* Main Content */}
      <Box className="flex-1 flex flex-col overflow-hidden">
        {/* Header / Search */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
          <div className="flex-1 max-w-xl">
            <TextField
              placeholder="Search global icons, themes, templates..."
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-slate-400" />
                  </InputAdornment>
                ),
                className: "bg-slate-50 border-none rounded-lg",
              }}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
            />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <Typography variant="body2" className="text-slate-500 font-medium">
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
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              <IconButton 
                size="small" 
                onClick={() => setViewMode("grid")}
                sx={{ 
                  borderRadius: '6px',
                  bgcolor: viewMode === 'grid' ? 'white' : 'transparent',
                  color: viewMode === 'grid' ? '#2563eb' : '#64748b',
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
                  color: viewMode === 'list' ? '#2563eb' : '#64748b',
                  boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  '&:hover': { bgcolor: viewMode === 'list' ? 'white' : 'rgba(0,0,0,0.04)' }
                }}
              >
                <ListIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <Box className="flex-1 overflow-y-auto p-6">
          <Box className="mb-4 flex justify-between items-center">
            <Typography variant="subtitle1" className="font-semibold text-slate-700">
              Global Assets — {activeFolder === "all" ? "All Files" : GLOBAL_FOLDERS.find(f => f.id === activeFolder)?.name}
            </Typography>

            <Tabs 
              value={mediaType} 
              onChange={(e: any, v: any) => setMediaType(v)}
              sx={{
                minHeight: '36px',
                '& .MuiTab-root': {
                  minHeight: '36px',
                  textTransform: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  px: 3,
                  borderRadius: '8px',
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
            </Box>
          )}
        </Box>
      </Box>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="font-bold">Upload New Global Asset</DialogTitle>
        <DialogContent dividers>
          <Box className="pt-2 flex flex-col gap-4">
            {!uploadFile ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all relative">
                <UploadIcon sx={{ fontSize: 56, color: "#94a3b8", mb: 2 }} />
                <Typography className="text-slate-700 font-bold">Click to browse or Drag & Drop</Typography>
                <Typography variant="caption" className="text-slate-400">Uploading to global library</Typography>
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
                  <TextField label="Asset Name" fullWidth size="small" value={uploadName} onChange={(e) => setUploadName(e.target.value)} />
                  <TextField 
                    select 
                    label="Global Folder" 
                    fullWidth 
                    size="small" 
                    value={uploadFolder} 
                    onChange={(e) => setUploadFolder(e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    {GLOBAL_FOLDERS.filter(f => f.id !== 'all').map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </TextField>
                </div>
                <TextField label="Alt Text" fullWidth size="small" multiline rows={2} value={uploadAlt} onChange={(e) => setUploadAlt(e.target.value)} placeholder="Describe the asset for SEO..." />
                
                <div className="grid grid-cols-2 gap-4">
                  <TextField label="Tags (comma separated)" fullWidth size="small" value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} placeholder="iphone, apple..." />
                  <TextField
                    select
                    label="Usage Type"
                    fullWidth
                    size="small"
                    value={uploadUsageType}
                    onChange={(e) => setUploadUsageType(e.target.value)}
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
            {uploading ? "Uploading..." : "Upload to Global"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <span className="font-bold">Global Asset Details</span>
          <Box className="flex gap-2">
            <Tooltip title="Copy Public URL">
              <IconButton size="small" onClick={() => {
                navigator.clipboard.writeText(editingFile?.url || "");
                toast.success("URL copied!");
              }}><CopyIcon fontSize="small"/></IconButton>
            </Tooltip>
            <IconButton size="small" color="error" onClick={() => editingFile && handleDelete(editingFile._id)}><DeleteIcon fontSize="small"/></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <div className="flex flex-col gap-6 pt-2">
             <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative">
                {editingFile?.mimeType.startsWith('image/') ? (
                   <img src={editingFile.url} className="max-w-full max-h-full object-contain" alt=""/>
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
                  <Typography variant="body2" className="font-bold">{editingFile && formatSize(editingFile.size)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-slate-400 block mb-1">DATE UPLOADED</Typography>
                  <Typography variant="body2" className="font-bold">{editingFile && new Date(editingFile.createdAt).toLocaleDateString()}</Typography>
                </Box>
             </div>

             <Divider />

             <div className="space-y-4">
                <TextField label="Display Name" fullWidth size="small" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <TextField label="Alt Text (SEO)" fullWidth size="small" value={editAlt} multiline rows={2} onChange={(e) => setEditAlt(e.target.value)} />
                <TextField label="Tags (comma separated)" fullWidth size="small" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="iphone, apple, gadgets..." />
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
                  tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
                  usageType: editUsageType
                });
                toast.success("Updated!");
                setFiles(prev => prev.map(f => f._id === editingFile._id ? { 
                  ...f, 
                  name: editName, 
                  alt: editAlt,
                  tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
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
              ? `Are you sure you want to delete ${selected.length} global assets permanently?`
              : "Are you sure you want to delete this global asset permanently?"
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
