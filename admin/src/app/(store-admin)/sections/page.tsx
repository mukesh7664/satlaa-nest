"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Tooltip,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
} from "@mui/icons-material";
import { sectionApi, ISectionType as ISection } from "@/services/section.api";
import MediaPickerModal from "@/components/MediaPickerModal";
import SectionDialog, { SECTION_TYPES } from "./SectionDialog";
import { useAppSelector } from "@/store/hooks";
import { RootState } from "@/store/store";
import { Alert } from "@mui/material";

export default function SectionsPage() {
  const { admin } = useAppSelector((state: RootState) => state.auth);
  const isSuperAdmin = admin?.role === "admin";

  const [sections, setSections] = useState<ISection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("active"); // 'active' | 'all'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ISection | null>(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Preview Image States
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [sectionForUpload, setSectionForUpload] = useState<ISection | null>(
    null
  );
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await sectionApi.getAll({
        search,
        category: category === "All" ? "" : category.toLowerCase(),
        includeInactive: statusFilter === "all",
        page: page + 1,
        limit: rowsPerPage,
      });
      setSections(response.data);
      setTotalItems(response.total);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    setPage(0); // Reset to first page on filter change
  }, [search, category, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, search, category, statusFilter]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      try {
        await sectionApi.delete(id);
        fetchData();
      } catch (error) {
        console.error("Failed to delete section:", error);
      }
    }
  };

  const handleUploadClick = (section: ISection) => {
    setSectionForUpload(section);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = async (file: any) => {
    const url = file.url;
    if (sectionForUpload) {
      try {
        await sectionApi.update(sectionForUpload._id || sectionForUpload.id, {
          ...sectionForUpload,
          thumbnail: url,
          tags: sectionForUpload.tags ?? undefined, // Convert null to undefined
        });
        setMediaPickerOpen(false);
        setSectionForUpload(null);
        fetchData();
      } catch (error) {
        console.error("Failed to update section thumbnail:", error);
      }
    }
  };

  const handleViewClick = (thumbnail: string) => {
    setPreviewImage(thumbnail);
    setPreviewDialogOpen(true);
  };

  const handleToggleStatus = async (section: ISection) => {
    try {
      await sectionApi.update(section._id || section.id, {
        isActive: !section.isActive,
      });
      fetchData();
    } catch (error) {
      console.error("Failed to update section status:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="start"
        sx={{ mb: 3 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sections Library</h1>
          <p className="text-sm text-slate-500 mt-1">Browse and manage pre-built layouts and sections for your pages.</p>
        </div>
        {isSuperAdmin && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedSection(null);
              setDialogOpen(true);
            }}
            sx={{
              bgcolor: "var(--primary)",
              "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              height: "30px",
            }}
          >
            Create Section
          </Button>
        )}
      </Stack>

      {/* Filters & Search - Compact Layout */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <TextField
            size="small"
            placeholder="Search sections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" className="text-slate-400" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 260 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                height: "36px",
                fontSize: "13px",
                backgroundColor: "#ffffff",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
              },
            }}
          />

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: "All Sections", value: "All" },
              { label: "Headers", value: "header" },
              { label: "Footers", value: "footer" },
              { label: "Page Sections", value: "section" },
            ].map((item) => {
              const isActive = category === item.value;
              return (
                <Button
                  key={item.value}
                  variant={isActive ? "contained" : "outlined"}
                  size="small"
                  onClick={() => {
                    setCategory(item.value);
                    setPage(0);
                  }}
                  sx={{
                    height: "30px",
                    minHeight: "30px",
                    boxSizing: "border-box",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: "13px",
                    px: 2,
                    py: 0,
                    fontWeight: isActive ? 600 : 500,
                    bgcolor: isActive ? "var(--primary)" : "transparent",
                    color: isActive ? "#ffffff" : "#475569",
                    borderColor: isActive ? "var(--primary)" : "#e2e8f0",
                    "&:hover": {
                      bgcolor: isActive ? "var(--primary)" : "#f1f5f9",
                      borderColor: isActive ? "var(--primary)" : "#cbd5e1",
                      filter: isActive ? "brightness(0.95)" : "none",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        {isSuperAdmin && (
          <FormControl size="small" sx={{ width: 130 }}>
            <InputLabel sx={{ fontSize: "13px", transform: "translate(14px, 8px) scale(1)", "&.MuiInputLabel-shrink": { transform: "translate(14px, -6px) scale(0.75)" } }}>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                borderRadius: "8px",
                height: "36px",
                fontSize: "13px",
                backgroundColor: "#ffffff",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
              }}
            >
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="all">Show All</MenuItem>
            </Select>
          </FormControl>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Tags</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Preview</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "#475569" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : sections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-500 font-medium">No sections found</p>
                      <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sections.map((section) => (
                  <TableRow
                    key={section._id || section.id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "background-color 0.2s",
                    }}
                  >
                  <TableCell>
                    <Tooltip
                      disableInteractive={false}
                      title={
                        section.thumbnail ? (
                          <Box 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewClick(section.thumbnail!);
                            }}
                            sx={{ 
                              p: 0.5, 
                              position: "relative",
                              cursor: "pointer",
                              "&:hover .hover-overlay": {
                                opacity: 1
                              }
                            }}
                          >
                            <Box
                              component="img"
                              src={section.thumbnail}
                              alt={section.name}
                              sx={{
                                maxWidth: 320,
                                maxHeight: 200,
                                borderRadius: 1,
                                objectFit: "contain",
                                display: "block",
                              }}
                            />
                            {/* Centered Box Zoom/Fullscreen Overlay */}
                            <Box
                              className="hover-overlay"
                              sx={{
                                position: "absolute",
                                inset: 4, // Align with parent padding
                                bgcolor: "rgba(0, 0, 0, 0.45)",
                                borderRadius: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0,
                                transition: "opacity 0.2s ease-in-out",
                              }}
                            >
                              <Box
                                sx={{
                                  bgcolor: "rgba(255, 255, 255, 0.9)",
                                  borderRadius: "8px",
                                  p: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                                }}
                              >
                                <FullscreenIcon sx={{ fontSize: 24, color: "text.primary" }} />
                              </Box>
                            </Box>
                          </Box>
                        ) : (
                          "No preview image available"
                        )
                      }
                      placement="right"
                      arrow
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "background.paper",
                            boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                            border: "1px solid rgba(224, 224, 224, 0.8)",
                            maxWidth: "none",
                            p: 0,
                            color: "text.primary",
                          },
                        },
                        arrow: {
                          sx: {
                            color: "background.paper",
                            "&::before": {
                              border: "1px solid rgba(224, 224, 224, 0.8)",
                            },
                          },
                        },
                      }}
                    >
                      <span className="font-semibold text-slate-700 hover:text-indigo-600 cursor-pointer transition-colors border-b border-dashed border-slate-300 pb-0.5">
                        {section.name}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip label={section.type} size="small" />
                  </TableCell>
                  <TableCell>
                    {section.tags?.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5 }}
                        variant="outlined"
                      />
                    )) ?? null}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={section.isActive ? "Active" : "Inactive"}
                      color={section.isActive ? "success" : "default"}
                      size="small"
                      sx={{ mr: isSuperAdmin ? 1 : 0 }}
                    />
                    {isSuperAdmin && (
                      <Switch
                        size="small"
                        checked={section.isActive}
                        onChange={() => handleToggleStatus(section)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {isSuperAdmin && (
                        <Tooltip title="Upload Preview Image">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleUploadClick(section)}
                          >
                            <CloudUploadIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View Preview">
                        <span>
                          <IconButton
                            size="small"
                            color="info"
                            disabled={!section.thumbnail}
                            onClick={() =>
                              section.thumbnail &&
                              handleViewClick(section.thumbnail)
                            }
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>

                  <TableCell align="right">
                    <div className="flex justify-end gap-1">
                      {isSuperAdmin ? (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedSection(section);
                              setDialogOpen(true);
                            }}
                            sx={{ color: "#3b82f6" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(section._id || section.id)}
                            sx={{ color: "#ef4444" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          View Only
                        </Typography>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ borderTop: "1px solid #e2e8f0" }}
      />
    </div>

      <SectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        section={selectedSection}
        onSave={fetchData}
      />

      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        title="Select Preview Image"
      />

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Section Preview
          <IconButton onClick={() => setPreviewDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {previewImage && (
            <Box
              component="img"
              src={previewImage || ""}
              alt="Section Preview"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
                display: "block",
                mx: "auto",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
